/**
 * Dashboard.tsx — ChurnRadar main dashboard
 *
 * Three tabs:
 *   Tab 0 "Overview"         → /summary, /trend, /features, /stream
 *   Tab 1 "Customer search"  → /customers?limit=50
 *   Tab 2 "Predict customer" → POST /predict
 */

import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API = "http://localhost:8000";

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = 0 | 1 | 2;
type SortDir = "asc" | "desc";

interface ShapReason {
  feature: string;
  value: number;
  shap_impact: number;
  direction: string;
}

interface Customer {
  customer_id: string;
  churn_probability: number;
  risk_level: string;
  monthly_charges: number;
  tenure: number;
  contract: string;
  shap_reasons: ShapReason[];
  recommendation?: string;
}

interface Summary {
  total_customers: number;
  churn_rate_pct: number;
  avg_monthly_charges: number;
  monthly_revenue_lost: number;
  annual_revenue_lost: number;
}

interface TrendPoint {
  period: string;
  churn_rate: number;
  churned: number;
  total: number;
}

interface Feature {
  feature: string;
  importance: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const RISK_COLOR: Record<string, string> = {
  critical: "#ff3b3b",
  high: "#ff6b35",
  medium: "#ff9500",
  low: "#30d158",
};
const riskColor = (level: string) => RISK_COLOR[level] ?? "#888";

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

const TT_STYLE = {
  contentStyle: {
    background: "#111",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 11,
    color: "#f0f0f0",
    padding: "6px 10px",
  },
  labelStyle: { color: "#888", marginBottom: 4 },
};

// ════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════
const STYLES = `
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes ping   { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.4);opacity:0} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer{ 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes modalIn{ from{opacity:0;transform:scale(.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .db{ padding:clamp(1rem,2vw,1.5rem) clamp(1rem,3vw,2rem); min-height:100vh; background:var(--bg,#0a0a0f); color:var(--text-primary,#f0f0f0); font-family:var(--font-display,system-ui,sans-serif) }

  .db-hdr{ display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:8px }
  .db-hdr-l{ display:flex; align-items:center; gap:10px }
  .db-title{ font-size:clamp(13px,1.5vw,15px); font-weight:800; letter-spacing:-0.03em }
  .db-dot  { width:9px; height:9px; border-radius:50%; background:#30d158; animation:pulse 2s infinite; flex-shrink:0 }
  .db-dot-r{ width:6px; height:6px; border-radius:50%; background:#ff3b3b; animation:pulse 1.5s infinite; flex-shrink:0 }
  .db-badge{ font-family:var(--font-mono,monospace); font-size:10px; padding:2px 9px; border-radius:999px; background:#30d15818; border:1px solid #30d15833; color:#30d158 }
  .db-time { font-family:var(--font-mono,monospace); font-size:10px; color:var(--text-muted,#555) }
  .db-stream-badge{ font-family:var(--font-mono,monospace); font-size:10px; padding:2px 9px; border-radius:999px }

  .db-tabs{ display:flex; gap:4px; margin-bottom:1rem; background:var(--bg-card,#111); border:1px solid var(--bg-border,#1e1e2e); border-radius:10px; padding:4px; width:fit-content }
  .db-tab { padding:6px 18px; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; border:none; background:transparent; color:var(--text-muted,#555); transition:all .2s; white-space:nowrap; font-family:inherit }
  .db-tab.on{ background:var(--bg-border,#1e1e2e); color:var(--text-primary,#f0f0f0) }
  .db-tab:hover:not(.on){ color:var(--text-secondary,#aaa) }

  .db-metrics{ display:grid; grid-template-columns:repeat(auto-fit,minmax(clamp(130px,18vw,190px),1fr)); gap:10px; margin-bottom:10px }
  .db-mc{ background:var(--bg-card,#111); border:1px solid var(--bg-border,#1e1e2e); border-radius:12px; padding:clamp(.7rem,1.5vw,1.1rem) clamp(.7rem,1.5vw,1.25rem); position:relative; overflow:hidden; animation:fadeUp .5s ease both }
  .db-mc-bar{ position:absolute; top:0; left:0; right:0; height:2px }
  .db-mc-val{ font-family:var(--font-mono,monospace); font-size:clamp(1.1rem,2.5vw,1.8rem); font-weight:700; letter-spacing:-.02em; line-height:1; margin-bottom:5px }
  .db-mc-lbl{ font-size:clamp(11px,1.1vw,13px); font-weight:600; margin-bottom:2px }
  .db-mc-sub{ font-size:clamp(10px,.9vw,11px); color:var(--text-muted,#555); line-height:1.4 }
  .db-skel{ height:1.8rem; width:80px; border-radius:6px; background:linear-gradient(90deg,var(--bg-border,#1e1e2e) 25%,#2a2a3a 50%,var(--bg-border,#1e1e2e) 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; margin-bottom:5px }

  .db-panel{ background:var(--bg-card,#111); border:1px solid var(--bg-border,#1e1e2e); border-radius:12px; overflow:hidden; margin-bottom:10px }
  .db-ph  { padding:clamp(.55rem,.9vw,.8rem) clamp(.75rem,1.2vw,1.1rem); border-bottom:1px solid var(--bg-border,#1e1e2e); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px }
  .db-pt  { font-size:clamp(11px,1.1vw,13px); font-weight:700; letter-spacing:-.01em }
  .db-ps  { font-family:var(--font-mono,monospace); font-size:clamp(9px,.9vw,11px); color:var(--text-muted,#555) }

  .db-2col{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px }
  @media(max-width:860px){ .db-2col{ grid-template-columns:1fr } }

  .db-shap-row{ padding:clamp(.35rem,.7vw,.5rem) clamp(.75rem,1.2vw,1.1rem); display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--bg-border,#1e1e2e) }
  .db-shap-row:last-child{ border-bottom:none }
  .db-shap-lbl{ font-size:clamp(10px,1vw,12px); color:var(--text-secondary,#ccc); width:clamp(120px,14vw,160px); flex-shrink:0 }
  .db-shap-bg { flex:1; height:5px; background:var(--bg-border,#1e1e2e); border-radius:4px }
  .db-shap-val{ font-family:var(--font-mono,monospace); font-size:11px; color:var(--text-muted,#555); width:32px; text-align:right; flex-shrink:0 }

  .db-feed-row{ padding:clamp(.45rem,.8vw,.65rem) clamp(.75rem,1.2vw,1.1rem); border-bottom:1px solid var(--bg-border,#1e1e2e); display:flex; align-items:center; justify-content:space-between; gap:8px; position:relative; transition:opacity .45s ease,transform .45s cubic-bezier(.22,1,.36,1) }
  .db-feed-row:last-child{ border-bottom:none }
  .db-feed-id { font-family:var(--font-mono,monospace); font-size:clamp(11px,1vw,12px); font-weight:600 }
  .db-feed-sub{ font-family:var(--font-mono,monospace); font-size:clamp(9px,.9vw,10px); color:var(--text-muted,#555); margin-top:2px }
  .db-ping{ position:absolute; top:50%; right:clamp(.75rem,1.2vw,1.1rem); transform:translateY(-50%); width:6px; height:6px; border-radius:50%; background:#30d158; animation:ping 1.1s ease-out }
  .db-ftr { padding:clamp(.4rem,.7vw,.55rem) clamp(.75rem,1.2vw,1.1rem); display:flex; align-items:center; gap:8px; border-top:1px solid var(--bg-border,#1e1e2e) }
  .db-ftr span{ font-family:var(--font-mono,monospace); font-size:clamp(9px,.9vw,10px); color:var(--text-muted,#555) }

  .rb{ font-family:var(--font-mono,monospace); font-size:clamp(9px,.9vw,10px); font-weight:600; padding:2px 7px; border-radius:4px; white-space:nowrap; text-transform:uppercase; letter-spacing:.04em }

  .db-empty{ padding:2rem; text-align:center; font-family:var(--font-mono,monospace); font-size:11px; color:var(--text-muted,#555) }

  /* ── Priority table ── */
  .pq-table{ width:100%; border-collapse:collapse; font-size:clamp(10px,.9vw,12px) }
  .pq-table th{ font-family:var(--font-mono,monospace); font-size:clamp(9px,.8vw,10px); color:#555; text-transform:uppercase; letter-spacing:.08em; text-align:left; font-weight:400; padding:clamp(.4rem,.7vw,.55rem) clamp(.5rem,1vw,.85rem); border-bottom:1px solid #1e1e2e; white-space:nowrap; position:sticky; top:0; background:var(--bg-card,#111); z-index:1 }
  .pq-table td{ padding:clamp(.45rem,.8vw,.6rem) clamp(.5rem,1vw,.85rem); border-bottom:1px solid #1e1e2e; white-space:nowrap; vertical-align:middle }
  .pq-table tr:last-child td{ border-bottom:none }
  .pq-table tbody tr{ cursor:pointer; transition:background .15s }
  .pq-table tbody tr:hover td{ background:rgba(255,255,255,.04) }

  /* ── Modal ── */
  .modal-overlay{ position:fixed; inset:0; z-index:1000; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; padding:1rem }
  .modal-box{ background:#111; border:1px solid #2a2a3a; border-radius:16px; width:100%; max-width:500px; max-height:85vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,0.7); animation:modalIn .2s ease both }
  .modal-hdr{ padding:1rem 1.25rem; border-bottom:1px solid #1e1e2e; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:#111; z-index:1 }
  .modal-close{ background:#1e1e2e; border:1px solid #2a2a3a; border-radius:6px; color:#888; cursor:pointer; padding:4px 10px; font-family:var(--font-mono,monospace); font-size:12px; transition:color .15s }
  .modal-close:hover{ color:#f0f0f0 }
  .modal-section{ padding:1rem 1.25rem; border-bottom:1px solid #1e1e2e }
  .modal-section:last-child{ border-bottom:none }
  .modal-section-title{ font-family:var(--font-mono,monospace); font-size:10px; color:#555; text-transform:uppercase; letter-spacing:.08em; margin-bottom:.6rem }
  .modal-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px }
  .modal-stat{ background:#0a0a0f; border:1px solid #1e1e2e; border-radius:8px; padding:8px 12px }
  .modal-stat-label{ font-family:var(--font-mono,monospace); font-size:9px; color:#555; text-transform:uppercase; letter-spacing:.08em; margin-bottom:3px }
  .modal-stat-value{ font-family:var(--font-mono,monospace); font-size:12px; font-weight:600; color:#f0f0f0 }

  /* ── Search tab ── */
  .db-search-bar{ display:flex; align-items:center; gap:8px; padding:clamp(.6rem,1vw,.85rem) clamp(.75rem,1.2vw,1.1rem); border-bottom:1px solid var(--bg-border,#1e1e2e); flex-wrap:wrap }
  .db-input { background:var(--bg,#0a0a0f); border:1px solid var(--bg-border,#1e1e2e); border-radius:7px; padding:6px 10px; color:var(--text-primary,#f0f0f0); font-family:var(--font-mono,monospace); font-size:12px; outline:none; transition:border-color .2s }
  .db-input:focus{ border-color:#333 }
  .db-input::placeholder{ color:var(--text-muted,#555) }
  .db-select{ background:var(--bg,#0a0a0f); border:1px solid var(--bg-border,#1e1e2e); border-radius:7px; padding:6px 10px; color:var(--text-secondary,#888); font-family:var(--font-mono,monospace); font-size:11px; outline:none; cursor:pointer }
  .db-tbl-wrap{ overflow-x:auto }
  .db-tbl{ width:100%; border-collapse:collapse; font-size:clamp(10px,.9vw,12px) }
  .db-tbl th{ font-family:var(--font-mono,monospace); font-size:clamp(9px,.8vw,10px); color:var(--text-muted,#555); text-transform:uppercase; letter-spacing:.08em; text-align:left; padding:clamp(.4rem,.7vw,.55rem) clamp(.75rem,1.2vw,1.1rem); border-bottom:1px solid var(--bg-border,#1e1e2e); white-space:nowrap; cursor:pointer; user-select:none }
  .db-tbl th:hover{ color:var(--text-secondary,#888) }
  .db-tbl td{ padding:clamp(.45rem,.8vw,.65rem) clamp(.75rem,1.2vw,1.1rem); border-bottom:1px solid var(--bg-border,#1e1e2e); vertical-align:middle; white-space:nowrap }
  .db-tbl tr:last-child td{ border-bottom:none }
  .db-tbl tr:hover td{ background:rgba(255,255,255,.015) }
  .db-tbl-id  { font-family:var(--font-mono,monospace); font-weight:600 }
  .db-tbl-mono{ font-family:var(--font-mono,monospace); color:var(--text-muted,#888) }
  .db-tbl-ftr { padding:clamp(.4rem,.7vw,.55rem) clamp(.75rem,1.2vw,1.1rem); display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--bg-border,#1e1e2e) }
  .db-tbl-ftr span{ font-family:var(--font-mono,monospace); font-size:10px; color:var(--text-muted,#555) }
  .db-bar-wrap{ display:flex; align-items:center; gap:6px }
  .db-bar-bg  { width:50px; height:4px; background:var(--bg-border,#1e1e2e); border-radius:4px; flex-shrink:0 }
  .db-pg-btn{ background:var(--bg-border,#1e1e2e); border:1px solid #2a2a3a; border-radius:5px; color:var(--text-muted,#888); font-family:var(--font-mono,monospace); font-size:10px; padding:3px 8px; cursor:pointer }
  .db-pg-btn:disabled{ opacity:.3; cursor:not-allowed }

  /* ── Predict tab ── */
  .db-pred-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px }
  @media(max-width:860px){ .db-pred-grid{ grid-template-columns:1fr } }
  .db-field-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:1rem }
  .db-field    { display:flex; flex-direction:column; gap:4px }
  .db-field-lbl{ font-size:11px; color:var(--text-muted,#666); font-family:var(--font-mono,monospace) }
  .db-field-input{ background:var(--bg,#0a0a0f); border:1px solid var(--bg-border,#1e1e2e); border-radius:7px; padding:6px 10px; color:var(--text-primary,#f0f0f0); font-family:var(--font-mono,monospace); font-size:12px; outline:none; width:100%; transition:border-color .2s }
  .db-field-input:focus{ border-color:#333 }
  .db-pred-btn{ margin:0 1rem 1rem; padding:10px; background:var(--red,#ff3b3b); border:none; border-radius:8px; color:#fff; font-size:13px; font-weight:700; cursor:pointer; width:calc(100% - 2rem); transition:opacity .2s,transform .2s; font-family:inherit }
  .db-pred-btn:hover:not(:disabled){ opacity:.88; transform:translateY(-1px) }
  .db-pred-btn:disabled{ opacity:.4; cursor:not-allowed }
  .db-result-box{ margin:0 1rem 1rem; background:var(--bg,#0a0a0f); border:1px solid var(--bg-border,#1e1e2e); border-radius:10px; padding:1rem }
  .db-result-top { display:flex; align-items:center; gap:1rem; margin-bottom:.85rem; padding-bottom:.75rem; border-bottom:1px solid var(--bg-border,#1e1e2e) }
  .db-result-prob{ font-family:var(--font-mono,monospace); font-size:2.6rem; font-weight:700; line-height:1 }
  .db-result-lbl { font-size:13px; font-weight:600; margin-bottom:3px }
  .db-result-sub { font-size:11px; color:var(--text-muted,#666); margin-bottom:6px }
  .db-shap-title { font-size:10px; font-family:var(--font-mono,monospace); color:var(--text-muted,#555); text-transform:uppercase; letter-spacing:.08em; margin-bottom:.5rem }
  .db-result-shap-row{ display:flex; align-items:center; gap:8px; margin-bottom:8px }
  .db-result-shap-lbl{ font-size:clamp(10px,.9vw,11px); color:var(--text-secondary,#ccc); width:130px; flex-shrink:0 }
  .db-result-shap-bg { flex:1; height:5px; background:var(--bg-border,#1e1e2e); border-radius:4px }
  .db-result-shap-dir{ font-size:10px; font-family:var(--font-mono,monospace); width:85px; text-align:right; flex-shrink:0 }
  .db-result-rec{ margin-top:.75rem; padding:.5rem .75rem; border:1px solid #0af3; border-radius:7px; font-family:var(--font-mono,monospace); font-size:11px; color:#0af; line-height:1.5; background:rgba(0,170,255,.03) }
`;

// ════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function MetricCard({
  value,
  label,
  sub,
  color,
  loading,
  delay = 0,
}: {
  value: string;
  label: string;
  sub: string;
  color: string;
  loading?: boolean;
  delay?: number;
}) {
  return (
    <div className="db-mc" style={{ animationDelay: `${delay}s` }}>
      <div className="db-mc-bar" style={{ background: color }} />
      {loading ? (
        <div className="db-skel" />
      ) : (
        <div className="db-mc-val" style={{ color }}>
          {value}
        </div>
      )}
      <div className="db-mc-lbl">{label}</div>
      <div className="db-mc-sub">{sub}</div>
    </div>
  );
}

function RiskBadge({ level, prob }: { level: string; prob: number }) {
  const color = riskColor(level);
  return (
    <span
      className="rb"
      style={{
        color,
        background: color + "1a",
        border: `1px solid ${color}44`,
      }}
    >
      {level} {Math.round(prob * 100)}%
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMER DETAIL MODAL
// ════════════════════════════════════════════════════════════════════════════
function CustomerModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const maxImpact = Math.max(
    ...(customer.shap_reasons?.map((r) => Math.abs(r.shap_impact)) ?? [1]),
  );
  const color = riskColor(customer.risk_level);
  const prob = Math.round(customer.churn_probability * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-hdr">
          <div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 15,
                fontWeight: 700,
                color: "#f0f0f0",
                marginBottom: 5,
              }}
            >
              {customer.customer_id}
            </div>
            <RiskBadge
              level={customer.risk_level}
              prob={customer.churn_probability}
            />
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕ close
          </button>
        </div>

        {/* Churn probability bar */}
        <div className="modal-section">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              Churn probability
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 24,
                fontWeight: 700,
                color,
              }}
            >
              {prob}%
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: "#1e1e2e",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 8,
                borderRadius: 999,
                width: `${prob}%`,
                background: `linear-gradient(90deg, ${color}88, ${color})`,
                transition: "width .6s ease",
              }}
            />
          </div>
        </div>

        {/* Plan & account details */}
        <div className="modal-section">
          <div className="modal-section-title">Plan & account</div>
          <div className="modal-grid">
            {[
              { label: "Contract", value: customer.contract },
              {
                label: "Tenure",
                value: `${Math.round(customer.tenure)} months`,
              },
              {
                label: "Monthly £",
                value: `£${customer.monthly_charges?.toFixed(2)}`,
              },
              { label: "Risk level", value: customer.risk_level.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="modal-stat">
                <div className="modal-stat-label">{label}</div>
                <div className="modal-stat-value">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SHAP breakdown */}
        <div className="modal-section">
          <div className="modal-section-title">
            Why this score — SHAP drivers
          </div>
          {customer.shap_reasons?.map((r) => (
            <div
              key={r.feature}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#ccc",
                  width: 140,
                  flexShrink: 0,
                }}
              >
                {r.feature}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "#1e1e2e",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 6,
                    borderRadius: 4,
                    width: `${Math.min((Math.abs(r.shap_impact) / maxImpact) * 100, 100)}%`,
                    background:
                      r.direction === "increases risk" ? "#ff3b3b" : "#30d158",
                    transition: "width .6s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  width: 65,
                  textAlign: "right",
                  flexShrink: 0,
                  color:
                    r.direction === "increases risk" ? "#ff6b6b" : "#30d158",
                }}
              >
                {r.direction === "increases risk" ? "↑ risk" : "↓ risk"}
              </span>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        {customer.recommendation && (
          <div className="modal-section">
            <div className="modal-section-title">Recommended action</div>
            <div
              style={{
                background: "rgba(0,170,255,.04)",
                border: "1px solid rgba(0,170,255,.15)",
                borderRadius: 8,
                padding: ".75rem 1rem",
                fontFamily: "monospace",
                fontSize: 12,
                color: "#0af",
                lineHeight: 1.6,
              }}
            >
              → {customer.recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 0: OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
function OverviewTab({
  summary,
  trend,
  features,
  feed,
  priority,
  newestId,
  streamStatus,
}: {
  summary: Summary | null;
  trend: TrendPoint[];
  features: Feature[];
  feed: Customer[];
  priority: Customer[];
  newestId: string;
  streamStatus: string;
}) {
  const maxImp = features[0]?.importance ?? 1;
  const shapColor = (imp: number) => {
    const r = imp / maxImp;
    return r > 0.7 ? "#ff3b3b" : r > 0.4 ? "#ff9500" : "#0af";
  };

  // Modal state lives here — priority panel and modal are siblings
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Filter priority list to only medium / high / critical, all records
  const priorityRows = priority.filter((c) =>
    ["critical", "high", "medium"].includes(c.risk_level),
  );

  return (
    <>
      {/* Customer detail modal — rendered at root level so it overlays everything */}
      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Metric cards */}
      <div className="db-metrics">
        <MetricCard
          value={summary ? summary.total_customers.toLocaleString() : "—"}
          label="Total customers"
          sub="In dataset"
          color="#0af"
          loading={!summary}
          delay={0}
        />
        <MetricCard
          value={summary ? `${summary.churn_rate_pct}%` : "—"}
          label="Churn rate"
          sub="Actual churned"
          color="#ff3b3b"
          loading={!summary}
          delay={0.05}
        />
        <MetricCard
          value={summary ? gbp(summary.monthly_revenue_lost) : "—"}
          label="Monthly lost"
          sub="From churned customers"
          color="#ff9500"
          loading={!summary}
          delay={0.1}
        />
        <MetricCard
          value={summary ? gbp(summary.annual_revenue_lost) : "—"}
          label="Annual lost"
          sub="Projected from monthly"
          color="#ff3b3b"
          loading={!summary}
          delay={0.15}
        />
        <MetricCard
          value={summary ? `£${summary.avg_monthly_charges}` : "—"}
          label="Avg charge"
          sub="Per customer/month"
          color="#30d158"
          loading={!summary}
          delay={0.2}
        />
      </div>

      {/* Charts row */}
      <div className="db-2col">
        <div className="db-panel">
          <div className="db-ph">
            <span className="db-pt">Churn rate by tenure cohort</span>
            <span className="db-ps">% churned · /trend</span>
          </div>
          <div style={{ padding: "0.75rem 0.25rem 0.5rem", height: 200 }}>
            {trend.length === 0 ? (
              <div className="db-empty">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trend}
                  margin={{ top: 8, right: 14, bottom: 0, left: -18 }}
                >
                  <CartesianGrid
                    stroke="#1e1e2e"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      fill: "#555",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      fill: "#555",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    {...TT_STYLE}
                    formatter={(v: number) => [`${v}%`, "Churn rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="churn_rate"
                    stroke="#ff3b3b"
                    strokeWidth={2}
                    dot={{ fill: "#ff3b3b", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="db-panel">
          <div className="db-ph">
            <span className="db-pt">SHAP feature importance</span>
            <span className="db-ps">Mean |SHAP| · /features</span>
          </div>
          <div style={{ padding: "0.5rem 0" }}>
            {features.length === 0 ? (
              <div className="db-empty">Computing SHAP values…</div>
            ) : (
              features.slice(0, 7).map((f) => (
                <div className="db-shap-row" key={f.feature}>
                  <span className="db-shap-lbl">{f.feature}</span>
                  <div className="db-shap-bg">
                    <div
                      style={{
                        height: 5,
                        borderRadius: 4,
                        width: `${(f.importance / maxImp) * 100}%`,
                        background: shapColor(f.importance),
                        transition: "width .8s cubic-bezier(.22,1,.36,1)",
                      }}
                    />
                  </div>
                  <span className="db-shap-val">{f.importance.toFixed(3)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live feed + Priority queue */}
      <div className="db-2col" style={{ alignItems: "stretch" }}>
        {/* Live prediction stream */}
        <div
          className="db-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 280px)",
            minHeight: 300,
          }}
        >
          <div className="db-ph" style={{ flexShrink: 0 }}>
            <span className="db-pt">Live prediction stream</span>
            <span
              className="db-ps"
              style={{ color: streamStatus === "live" ? "#30d158" : "#555" }}
            >
              {streamStatus === "live"
                ? "● scoring · /stream"
                : streamStatus === "connecting"
                  ? "◌ connecting…"
                  : "✕ error"}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {feed.length === 0 ? (
              <div className="db-empty">Waiting for stream…</div>
            ) : (
              feed.map((c) => (
                <div
                  key={`${c.customer_id}-${c.churn_probability}`}
                  className="db-feed-row"
                  style={{
                    background:
                      c.risk_level === "critical"
                        ? "rgba(255,59,59,0.03)"
                        : "transparent",
                  }}
                >
                  <div>
                    <div className="db-feed-id">{c.customer_id}</div>
                    <div className="db-feed-sub">
                      {c.contract} · {Math.round(c.tenure)}mo · £
                      {c.monthly_charges?.toFixed(2)}/mo
                    </div>
                  </div>
                  <RiskBadge level={c.risk_level} prob={c.churn_probability} />
                  {c.customer_id === newestId && <div className="db-ping" />}
                </div>
              ))
            )}
          </div>
          <div className="db-ftr" style={{ flexShrink: 0 }}>
            <div className="db-dot-r" />
            <span>New prediction every ~2s</span>
          </div>
        </div>

        {/* Priority action queue — scrollable table, click row for modal */}
        <div
          className="db-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 280px)",
            minHeight: 300,
          }}
        >
          <div className="db-ph" style={{ flexShrink: 0 }}>
            <span className="db-pt">Priority action queue</span>
            <span className="db-ps">
              {priorityRows.length > 0
                ? `${priorityRows.length} customers · `
                : ""}
              critical · high · medium · click row for details
            </span>
          </div>

          {/* Scrollable table area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "auto",
              minHeight: 0,
            }}
          >
            {priorityRows.length === 0 ? (
              <div className="db-empty">
                Building from stream…
                <br />
                <span
                  style={{
                    fontSize: 10,
                    color: "#444",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Medium / high / critical customers appear here
                </span>
              </div>
            ) : (
              <table className="pq-table">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Customer",
                      "Risk",
                      "Contract",
                      "Tenure",
                      "£/mo",
                      "Top driver",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {priorityRows.map((c, i) => {
                    const top =
                      c.shap_reasons?.find(
                        (r) => r.direction === "increases risk",
                      ) ?? c.shap_reasons?.[0];
                    return (
                      <tr
                        key={c.customer_id}
                        onClick={() => setSelectedCustomer(c)}
                        style={{
                          background:
                            c.risk_level === "critical"
                              ? "rgba(255,59,59,0.02)"
                              : "transparent",
                        }}
                      >
                        {/* Rank */}
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#555",
                          }}
                        >
                          {i + 1}
                        </td>

                        {/* Customer ID */}
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(11px,1vw,12px)",
                            fontWeight: 600,
                            color: "#f0f0f0",
                          }}
                        >
                          {c.customer_id}
                        </td>

                        {/* Risk badge */}
                        <td>
                          <RiskBadge
                            level={c.risk_level}
                            prob={c.churn_probability}
                          />
                        </td>

                        {/* Contract */}
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(10px,.9vw,11px)",
                            color: "#888",
                          }}
                        >
                          {c.contract}
                        </td>

                        {/* Tenure */}
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(10px,.9vw,11px)",
                            color: "#888",
                          }}
                        >
                          {Math.round(c.tenure)}mo
                        </td>

                        {/* Monthly charges */}
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(10px,.9vw,11px)",
                            color: "#888",
                          }}
                        >
                          £{c.monthly_charges?.toFixed(2)}
                        </td>

                        {/* Top SHAP driver with mini bar */}
                        <td>
                          {top ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 10,
                                  color: "#888",
                                  minWidth: 80,
                                }}
                              >
                                {top.feature}
                              </span>
                              <div
                                style={{
                                  width: 36,
                                  height: 4,
                                  background: "#1e1e2e",
                                  borderRadius: 4,
                                  flexShrink: 0,
                                }}
                              >
                                <div
                                  style={{
                                    height: 4,
                                    borderRadius: 4,
                                    width: `${Math.min(Math.abs(top.shap_impact) * 60, 100)}%`,
                                    background:
                                      top.direction === "increases risk"
                                        ? "#ff3b3b"
                                        : "#30d158",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 9,
                                  color: "#555",
                                }}
                              >
                                {top.shap_impact > 0 ? "+" : ""}
                                {top.shap_impact.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1: CUSTOMER SEARCH
// ════════════════════════════════════════════════════════════════════════════
function SearchTab({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [sortKey, setSortKey] = useState<"risk" | "charges" | "tenure">("risk");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const filtered = customers
    .filter((c) => {
      const q = query.toLowerCase();
      return (
        (!q ||
          c.customer_id.toLowerCase().includes(q) ||
          c.contract.toLowerCase().includes(q) ||
          c.risk_level.toLowerCase().includes(q)) &&
        (!riskFilter || c.risk_level === riskFilter) &&
        (!contractFilter || c.contract === contractFilter)
      );
    })
    .sort((a, b) => {
      const get = (x: Customer) =>
        sortKey === "risk"
          ? x.churn_probability
          : sortKey === "charges"
            ? x.monthly_charges
            : x.tenure;
      return sortDir === "desc" ? get(b) - get(a) : get(a) - get(b);
    });

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
    setPage(0);
  };
  const sortIcon = (k: typeof sortKey) =>
    sortKey === k ? (sortDir === "desc" ? " ↓" : " ↑") : " ↕";

  return (
    <div className="db-panel">
      <div className="db-search-bar">
        <input
          className="db-input"
          style={{ flex: 1, minWidth: 180 }}
          placeholder="Search by ID, contract, risk level…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
        <select
          className="db-select"
          value={riskFilter}
          onChange={(e) => {
            setRiskFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All risk levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          className="db-select"
          value={contractFilter}
          onChange={(e) => {
            setContractFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All contracts</option>
          <option value="Month-to-month">Month-to-month</option>
          <option value="One year">One year</option>
          <option value="Two year">Two year</option>
        </select>
      </div>

      {customers.length === 0 ? (
        <div className="db-empty">Loading customers from /customers…</div>
      ) : (
        <div className="db-tbl-wrap">
          <table className="db-tbl">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th onClick={() => toggleSort("risk")}>
                  Risk score{sortIcon("risk")}
                </th>
                <th>Contract</th>
                <th onClick={() => toggleSort("tenure")}>
                  Tenure{sortIcon("tenure")}
                </th>
                <th onClick={() => toggleSort("charges")}>
                  Monthly £{sortIcon("charges")}
                </th>
                <th>Top SHAP driver</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c) => {
                const topShap = c.shap_reasons?.[0];
                return (
                  <tr key={c.customer_id}>
                    <td className="db-tbl-id">{c.customer_id}</td>
                    <td>
                      <RiskBadge
                        level={c.risk_level}
                        prob={c.churn_probability}
                      />
                    </td>
                    <td className="db-tbl-mono">{c.contract}</td>
                    <td className="db-tbl-mono">{Math.round(c.tenure)}mo</td>
                    <td className="db-tbl-mono">
                      £{c.monthly_charges?.toFixed(2)}
                    </td>
                    <td>
                      {topShap ? (
                        <div className="db-bar-wrap">
                          <span
                            style={{
                              fontSize: 10,
                              color: "#888",
                              minWidth: 110,
                              fontFamily: "monospace",
                            }}
                          >
                            {topShap.feature}
                          </span>
                          <div className="db-bar-bg">
                            <div
                              style={{
                                height: 4,
                                borderRadius: 4,
                                width: `${Math.min(Math.abs(topShap.shap_impact) * 60, 100)}%`,
                                background:
                                  topShap.direction === "increases risk"
                                    ? "#ff3b3b"
                                    : "#30d158",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 10,
                              color: "#555",
                            }}
                          >
                            {topShap.shap_impact > 0 ? "+" : ""}
                            {topShap.shap_impact.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        color: "#0af",
                        maxWidth: 180,
                      }}
                    >
                      {c.recommendation ? `→ ${c.recommendation}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="db-tbl-ftr">
        <span>
          Showing {paged.length} of {filtered.length} customers
        </span>
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              className="db-pg-btn"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span
              style={{ fontFamily: "monospace", fontSize: 10, color: "#555" }}
            >
              {page + 1}/{totalPages}
            </span>
            <button
              className="db-pg-btn"
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2: PREDICT CUSTOMER
// ════════════════════════════════════════════════════════════════════════════
function PredictTab() {
  const [form, setForm] = useState({
    gender: "Male",
    SeniorCitizen: "0",
    Partner: "No",
    Dependents: "No",
    tenure: "2",
    PhoneService: "Yes",
    MultipleLines: "No",
    InternetService: "Fiber optic",
    OnlineSecurity: "No",
    OnlineBackup: "No",
    DeviceProtection: "No",
    TechSupport: "No",
    StreamingTV: "No",
    StreamingMovies: "No",
    Contract: "Month-to-month",
    PaperlessBilling: "Yes",
    PaymentMethod: "Electronic check",
    MonthlyCharges: "94.50",
    TotalCharges: "189.00",
  });

  const [result, setResult] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const FIELDS: Array<{
    key: string;
    label: string;
    type?: string;
    options?: string[];
  }> = [
    { key: "gender", label: "Gender", options: ["Male", "Female"] },
    { key: "SeniorCitizen", label: "Senior citizen", options: ["0", "1"] },
    { key: "Partner", label: "Partner", options: ["Yes", "No"] },
    { key: "Dependents", label: "Dependents", options: ["Yes", "No"] },
    { key: "tenure", label: "Tenure (months)", type: "number" },
    { key: "MonthlyCharges", label: "Monthly charges (£)", type: "number" },
    { key: "TotalCharges", label: "Total charges (£)", type: "number" },
    { key: "PhoneService", label: "Phone service", options: ["Yes", "No"] },
    {
      key: "MultipleLines",
      label: "Multiple lines",
      options: ["No", "Yes", "No phone service"],
    },
    {
      key: "InternetService",
      label: "Internet service",
      options: ["Fiber optic", "DSL", "No"],
    },
    {
      key: "OnlineSecurity",
      label: "Online security",
      options: ["No", "Yes", "No internet service"],
    },
    {
      key: "OnlineBackup",
      label: "Online backup",
      options: ["No", "Yes", "No internet service"],
    },
    {
      key: "DeviceProtection",
      label: "Device protection",
      options: ["No", "Yes", "No internet service"],
    },
    {
      key: "TechSupport",
      label: "Tech support",
      options: ["No", "Yes", "No internet service"],
    },
    {
      key: "StreamingTV",
      label: "Streaming TV",
      options: ["No", "Yes", "No internet service"],
    },
    {
      key: "StreamingMovies",
      label: "Streaming movies",
      options: ["No", "Yes", "No internet service"],
    },
    {
      key: "Contract",
      label: "Contract type",
      options: ["Month-to-month", "One year", "Two year"],
    },
    {
      key: "PaperlessBilling",
      label: "Paperless billing",
      options: ["Yes", "No"],
    },
    {
      key: "PaymentMethod",
      label: "Payment method",
      options: [
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
      ],
    },
  ];

  const runPredict = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body: Record<string, string | number> = { ...form };
      ["tenure", "MonthlyCharges", "TotalCharges", "SeniorCitizen"].forEach(
        (k) => {
          body[k] = parseFloat(form[k as keyof typeof form]) || 0;
        },
      );
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status} — ${await res.text()}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach /predict");
    } finally {
      setLoading(false);
    }
  };

  const maxShap = result
    ? Math.max(...result.shap_reasons.map((r) => Math.abs(r.shap_impact)))
    : 1;

  return (
    <div className="db-pred-grid">
      <div className="db-panel">
        <div className="db-ph">
          <span className="db-pt">Customer details</span>
          <span className="db-ps">POST → /predict</span>
        </div>
        <div className="db-field-grid">
          {FIELDS.map((f) => (
            <div className="db-field" key={f.key}>
              <span className="db-field-lbl">{f.label}</span>
              {f.options ? (
                <select
                  className="db-field-input"
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setField(f.key, e.target.value)}
                >
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="db-field-input"
                  type={f.type ?? "text"}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <button className="db-pred-btn" onClick={runPredict} disabled={loading}>
          {loading ? "Scoring…" : "Run prediction →"}
        </button>
      </div>

      <div className="db-panel">
        <div className="db-ph">
          <span className="db-pt">Prediction result</span>
          <span className="db-ps">
            {result
              ? `scored · ${result.customer_id}`
              : loading
                ? "scoring…"
                : "waiting for input…"}
          </span>
        </div>

        {!result && !error && !loading && (
          <div className="db-empty">
            Fill in customer details and
            <br />
            click Run prediction to see results.
          </div>
        )}
        {loading && (
          <div style={{ padding: "1.5rem" }}>
            <div className="db-skel" style={{ width: 120, marginBottom: 10 }} />
            <div className="db-skel" style={{ width: 80 }} />
          </div>
        )}
        {error && (
          <div
            style={{
              padding: "1rem",
              fontFamily: "monospace",
              fontSize: 11,
              color: "#ff3b3b",
              wordBreak: "break-all",
            }}
          >
            {error}
          </div>
        )}
        {result && !loading && (
          <div className="db-result-box">
            <div className="db-result-top">
              <div
                className="db-result-prob"
                style={{ color: riskColor(result.risk_level) }}
              >
                {Math.round(result.churn_probability * 100)}%
              </div>
              <div>
                <div className="db-result-lbl">Churn probability</div>
                <div className="db-result-sub">
                  Risk:{" "}
                  <span
                    style={{
                      color: riskColor(result.risk_level),
                      fontWeight: 700,
                    }}
                  >
                    {result.risk_level.toUpperCase()}
                  </span>
                </div>
                <RiskBadge
                  level={result.risk_level}
                  prob={result.churn_probability}
                />
              </div>
            </div>
            <div className="db-shap-title">SHAP breakdown — why this score</div>
            {result.shap_reasons.map((r) => (
              <div className="db-result-shap-row" key={r.feature}>
                <span className="db-result-shap-lbl">{r.feature}</span>
                <div className="db-result-shap-bg">
                  <div
                    style={{
                      height: 5,
                      borderRadius: 4,
                      width: `${Math.min((Math.abs(r.shap_impact) / maxShap) * 100, 100)}%`,
                      background:
                        r.direction === "increases risk"
                          ? "#ff3b3b"
                          : "#30d158",
                      transition: "width .7s cubic-bezier(.22,1,.36,1)",
                    }}
                  />
                </div>
                <span
                  className="db-result-shap-dir"
                  style={{
                    color:
                      r.direction === "increases risk" ? "#ff3b3b" : "#30d158",
                  }}
                >
                  {r.direction === "increases risk"
                    ? "↑ increases"
                    : "↓ decreases"}
                </span>
              </div>
            ))}
            {result.recommendation && (
              <div className="db-result-rec">→ {result.recommendation}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [tab, setTab] = useState<Tab>(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [feed, setFeed] = useState<Customer[]>([]);
  const [priority, setPriority] = useState<Customer[]>([]);
  const [newestId, setNewestId] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [streamStatus, setStreamStatus] = useState<
    "connecting" | "live" | "error"
  >("connecting");

  // Tracks ALL customers ever seen by the stream — no cap
  const seenPriority = useRef<Map<string, Customer>>(new Map());

  useEffect(() => {
    const stamp = () => setLastUpdated(new Date().toLocaleTimeString());
    fetch(`${API}/summary`)
      .then((r) => r.json())
      .then((d) => {
        setSummary(d);
        stamp();
      })
      .catch((e) => console.error("[/summary]", e));
    fetch(`${API}/trend`)
      .then((r) => r.json())
      .then((d) => setTrend(d.trend ?? []))
      .catch((e) => console.error("[/trend]", e));
    fetch(`${API}/features`)
      .then((r) => r.json())
      .then((d) => setFeatures(d.features ?? []))
      .catch((e) => console.error("[/features]", e));
    fetch(`${API}/customers?limit=50`)
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .catch((e) => console.error("[/customers]", e));
  }, []);

  useEffect(() => {
    const es = new EventSource(`${API}/stream`);
    es.onopen = () => {
      setStreamStatus("live");
      console.log("[stream] connected");
    };
    es.onerror = () => {
      setStreamStatus("error");
    };
    es.onmessage = (e) => {
      try {
        const c: Customer = JSON.parse(e.data);
        if (!c || (c as any).error) return;
        setNewestId(c.customer_id);
        setLastUpdated(new Date().toLocaleTimeString());
        setFeed((prev) => [c, ...prev].slice(0, 8));

        // Store ALL customers — no .slice(0, 5) so priority queue shows everyone
        seenPriority.current.set(c.customer_id, c);
        setPriority(
          [...seenPriority.current.values()].sort(
            (a, b) => b.churn_probability - a.churn_probability,
          ),
          // ← no slice here — all records passed, OverviewTab filters to med/high/critical
        );
      } catch (err) {
        console.warn("[stream] parse error:", err);
      }
    };
    return () => es.close();
  }, []);

  const streamBadgeStyle = {
    background:
      streamStatus === "live"
        ? "#30d15818"
        : streamStatus === "connecting"
          ? "#ff950018"
          : "#ff3b3b18",
    border: `1px solid ${streamStatus === "live" ? "#30d15833" : streamStatus === "connecting" ? "#ff950033" : "#ff3b3b33"}`,
    color:
      streamStatus === "live"
        ? "#30d158"
        : streamStatus === "connecting"
          ? "#ff9500"
          : "#ff3b3b",
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="db">
        <div className="db-hdr">
          <div className="db-hdr-l">
            <div className="db-dot" />
            <span className="db-title">ChurnRadar</span>
            <span className="db-badge">Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="db-stream-badge" style={streamBadgeStyle}>
              {streamStatus === "live"
                ? "● stream live"
                : streamStatus === "connecting"
                  ? "◌ connecting…"
                  : "✕ stream error"}
            </span>
            {lastUpdated && (
              <span className="db-time">updated {lastUpdated}</span>
            )}
          </div>
        </div>

        <div className="db-tabs">
          {(["Overview", "Customer search", "Predict customer"] as const).map(
            (label, i) => (
              <button
                key={label}
                className={`db-tab${tab === i ? " on" : ""}`}
                onClick={() => setTab(i as Tab)}
              >
                {label}
              </button>
            ),
          )}
        </div>

        {tab === 0 && (
          <OverviewTab
            summary={summary}
            trend={trend}
            features={features}
            feed={feed}
            priority={priority}
            newestId={newestId}
            streamStatus={streamStatus}
          />
        )}
        {tab === 1 && <SearchTab customers={customers} />}
        {tab === 2 && <PredictTab />}
      </div>
    </>
  );
}
