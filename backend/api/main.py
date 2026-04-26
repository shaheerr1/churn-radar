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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = "/Users/shaheeraslam/Documents/Data/churn.csv"
df_raw = pd.read_csv(DATA_PATH)
df_raw = df_raw.dropna()

# ── endpoints ─────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "model": "churn_radar_v1"}


@app.post("/predict")
def predict_single(customer: CustomerInput):
    result = predict(customer.dict(), customer_id="manual")
    return result


@app.get("/summary")
def summary():
    total = len(df_raw)
    avg_monthly = round(float(df_raw['MonthlyCharges'].mean()), 2)
    churn_rate = round(
        df_raw['Churn'].apply(lambda x: 1 if x == 'Yes' else 0).mean() * 100, 1
    )
    monthly_lost = round(
        df_raw[df_raw['Churn'] == 'Yes']['MonthlyCharges'].sum(), 0
    )
    annual_lost = monthly_lost * 12

    return {
        "total_customers": total,
        "churn_rate_pct": churn_rate,
        "avg_monthly_charges": avg_monthly,
        "monthly_revenue_lost": monthly_lost,
        "annual_revenue_lost": annual_lost,
    }


@app.get("/stream")
async def stream():
    async def event_generator():
        idx = random.randint(0, len(df_raw) - 1)
        count = 0
        while True:
            row = df_raw.iloc[idx % len(df_raw)]
            customer_dict = row.to_dict()
            customer_id = str(customer_dict.pop('customerID', f'CUST-{idx}'))

            try:
                result = predict(customer_dict, customer_id=customer_id)
                payload = json.dumps(result)
                yield f"data: {payload}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

            idx += 1
            count += 1
            await asyncio.sleep(2)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )