from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from schemas import CustomerInput
from model import predict
import pandas as pd
import asyncio
import json
import os
import random

app = FastAPI(title="Churn Radar API")

# ── CORS ───────────────────────────────────────────────────────────────────────
# Allow all origins so the React dev server on :3000 or :5173 can call us freely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load dataset once at startup ───────────────────────────────────────────────
# We load the raw CSV and drop NaNs so every row is usable by the model
DATA_PATH = "churn.csv"

df_raw = pd.read_csv(DATA_PATH)
df_raw["TotalCharges"] = pd.to_numeric(df_raw["TotalCharges"], errors="coerce")
df_raw = df_raw.dropna()  # drops the ~11 rows where TotalCharges was blank
print(f"[startup] loaded {len(df_raw)} clean rows")


# ── In-memory caches ───────────────────────────────────────────────────────────
# /customers and /features are expensive (run predict() many times) so we cache
# them after the first call. They reset when the server restarts.
_customers_cache: dict = {}
_features_cache: dict = {}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /health
# Simple liveness check — useful for debugging connection issues from the frontend
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/health")
def health():
    return {"status": "ok", "model": "churn_radar_v1", "rows_loaded": len(df_raw)}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: POST /predict
# Accepts a single CustomerInput body and returns churn probability + SHAP reasons
# Used by Tab 3 "Predict customer" in the dashboard
#
# If you get 422 errors, check that ALL fields in CustomerInput (schemas.py)
# are present in the request body. Common missing fields: gender, Churn
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/predict")
def predict_single(customer: CustomerInput):
    result = predict(customer.dict(), customer_id="manual")
    return result


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /summary
# Returns aggregate stats computed from the full CSV
# Used by the 5 metric cards at the top of Tab 1 "Overview"
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/summary")
def summary():
    total = len(df_raw)
    avg_monthly = round(float(df_raw["MonthlyCharges"].mean()), 2)

    # Churn column is "Yes"/"No" strings — convert to 0/1 for math
    churn_binary = df_raw["Churn"].apply(lambda x: 1 if x == "Yes" else 0)
    churn_rate = round(float(churn_binary.mean() * 100), 1)

    churned_df = df_raw[df_raw["Churn"] == "Yes"]
    monthly_lost = round(float(churned_df["MonthlyCharges"].sum()), 0)
    annual_lost = monthly_lost * 12

    return {
        "total_customers": total,
        "churn_rate_pct": churn_rate,
        "avg_monthly_charges": avg_monthly,
        "monthly_revenue_lost": monthly_lost,
        "annual_revenue_lost": annual_lost,
    }


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /customers?limit=50
# Runs predict() on a random sample of rows and returns them sorted by risk
# Used by Tab 2 "Customer search" table
#
# Results are cached after the first call (keyed by limit) so subsequent
# tab switches are instant. If you change the CSV, restart the server.
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/customers")
def customers_list(limit: int = 50):
    cache_key = f"customers_{limit}"
    if cache_key in _customers_cache:
        return _customers_cache[cache_key]

    # Sample deterministically so the table is stable across refreshes
    sample = df_raw.sample(min(limit, len(df_raw)), random_state=42)
    results = []

    for idx, (_, row) in enumerate(sample.iterrows()):
        customer_dict = row.to_dict()
        # customerID is not a model feature — pull it out separately
        customer_id = str(customer_dict.pop("customerID", f"CUST-{idx:04d}"))
        # Churn is the label, not a feature — remove it so the model doesn't see it
        customer_dict.pop("Churn", None)
        try:
            result = predict(customer_dict, customer_id=customer_id)
            results.append(result)
        except Exception as e:
            # Log but don't crash — skip bad rows
            print(f"[/customers] skipped {customer_id}: {e}")

    # Sort by churn probability descending so highest risk appears first
    results.sort(key=lambda x: x.get("churn_probability", 0), reverse=True)
    payload = {"customers": results, "total": len(results)}
    _customers_cache[cache_key] = payload
    return payload


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /features
# Aggregates mean absolute SHAP values across a sample to produce global
# feature importance. Used by the SHAP bar chart in Tab 1 "Overview".
#
# Cached after first call — this is the slowest endpoint (~150 predictions).
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/features")
def feature_importance():
    if _features_cache:
        return _features_cache

    sample = df_raw.sample(min(150, len(df_raw)), random_state=99)
    totals: dict[str, float] = {}
    counts: dict[str, int] = {}

    for idx, (_, row) in enumerate(sample.iterrows()):
        customer_dict = row.to_dict()
        customer_id = str(customer_dict.pop("customerID", f"FEAT-{idx}"))
        customer_dict.pop("Churn", None)
        try:
            result = predict(customer_dict, customer_id=customer_id)
            for reason in result.get("shap_reasons", []):
                feat = reason["feature"]
                impact = abs(reason["shap_impact"])
                totals[feat] = totals.get(feat, 0.0) + impact
                counts[feat] = counts.get(feat, 0) + 1
        except Exception as e:
            print(f"[/features] skipped row {idx}: {e}")

    features = [
        {"feature": feat, "importance": round(totals[feat] / counts[feat], 4)}
        for feat in totals
    ]
    features.sort(key=lambda x: x["importance"], reverse=True)
    result = {"features": features[:10]}
    _features_cache.update(result)
    return result


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /trend
# Buckets customers by tenure and computes churn rate per cohort
# Used by the line chart in Tab 1 "Overview"
#
# Reads directly from df_raw — no model calls needed, very fast
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/trend")
def churn_trend():
    # Define tenure buckets as (label, low_inclusive, high_exclusive)
    buckets = [
        ("0–6 mo",   0,   6),
        ("6–12 mo",  6,  12),
        ("12–18 mo", 12, 18),
        ("18–24 mo", 18, 24),
        ("24–36 mo", 24, 36),
        ("36–48 mo", 36, 48),
        ("48–60 mo", 48, 60),
        ("60+ mo",   60, 9999),
    ]

    trend = []
    for label, lo, hi in buckets:
        subset = df_raw[(df_raw["tenure"] >= lo) & (df_raw["tenure"] < hi)]
        if len(subset) == 0:
            continue
        churned_col = subset["Churn"].apply(lambda x: 1 if x == "Yes" else 0)
        trend.append({
            "period": label,
            "total": len(subset),
            "churned": int(churned_col.sum()),
            "churn_rate": round(float(churned_col.mean() * 100), 1),
        })

    return {"trend": trend}






# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT: GET /stream
# Server-Sent Events (SSE) stream — scores one customer every 2 seconds
# Used by the Live prediction stream and Priority action queue in Tab 1
#
# The frontend connects with: new EventSource("http://localhost:8000/stream")
# and listens for onmessage events containing JSON prediction objects
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/stream")
async def stream():
    async def event_generator():
        idx = random.randint(0, len(df_raw) - 1)
        while True:
            row = df_raw.iloc[idx % len(df_raw)]
            customer_dict = row.to_dict()
            customer_id = str(customer_dict.pop("customerID", f"CUST-{idx}"))
            customer_dict.pop("Churn", None)

            try:
                result = predict(customer_dict, customer_id=customer_id)
                payload = json.dumps(result)
                yield f"data: {payload}\n\n"
            except Exception as e:
                print(f"[/stream] prediction error at idx {idx}: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

            idx += 1
            await asyncio.sleep(2)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
