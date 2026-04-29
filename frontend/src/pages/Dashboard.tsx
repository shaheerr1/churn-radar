/**
 * Dashboard.tsx — ChurnRadar
 *
 * KEY CHANGES:
 * - Tab 1 "Customer search" is now fed LIVE from the stream (same data as feed)
 *   Every customer scored by /stream appears instantly in the search table.
 *   Search by ID works because we own the data directly in state.
 * - Metric cards are more interactive — show secondary stats + risk indicators
 * - SHAP importance replaced with a proper horizontal BarChart (Recharts)
 * - Priority queue search is fully fixed (trims, lowercases, exact substring)
 */

import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const API = "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const RISK_COLOR: Record<string, string> = {
  critical: "#ff3b3b",
  high: "#ff6b35",
  medium: "#ff9500",
  low: "#30d158",
};
const rc = (l: string) => RISK_COLOR[l] ?? "#888";
const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

const TT = {
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
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes ping    { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.4);opacity:0} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes modalIn { from{opacity:0;transform:scale(.97) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes rowSlide{ from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }

  *{ box-sizing:border-box }

  .db{ padding:clamp(1rem,2vw,1.5rem) clamp(1rem,3vw,2rem); min-height:100vh; background:var(--bg,#0a0a0f); color:#f0f0f0; font-family:var(--font-display,system-ui,sans-serif) }

  /* ─ header */
  .db-hdr  { display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:8px }
  .db-hdr-l{ display:flex;align-items:center;gap:10px }
  .db-title{ font-size:clamp(13px,1.5vw,15px);font-weight:800;letter-spacing:-0.03em }
  .db-dot  { width:9px;height:9px;border-radius:50%;background:#30d158;animation:pulse 2s infinite;flex-shrink:0 }
  .db-dot-r{ width:6px;height:6px;border-radius:50%;background:#ff3b3b;animation:pulse 1.5s infinite;flex-shrink:0 }
  .db-badge { font-family:monospace;font-size:10px;padding:2px 9px;border-radius:999px;background:#30d15818;border:1px solid #30d15833;color:#30d158 }
  .db-time  { font-family:monospace;font-size:10px;color:#555 }
  .db-sbadge{ font-family:monospace;font-size:10px;padding:2px 9px;border-radius:999px }

  /* ─ tabs */
  .db-tabs{ display:flex;gap:4px;margin-bottom:1rem;background:#111;border:1px solid #1e1e2e;border-radius:10px;padding:4px;width:fit-content }
  .db-tab { padding:6px 18px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#555;transition:all .2s;white-space:nowrap;font-family:inherit }
  .db-tab.on{ background:#1e1e2e;color:#f0f0f0 }
  .db-tab:hover:not(.on){ color:#aaa }

  /* ─ metric cards — enhanced */
  .db-metrics{ display:grid;grid-template-columns:repeat(auto-fit,minmax(clamp(160px,19vw,220px),1fr));gap:10px;margin-bottom:10px }
  .db-mc{ background:#111;border:1px solid #1e1e2e;border-radius:14px;padding:clamp(.85rem,1.8vw,1.25rem) clamp(.85rem,1.8vw,1.35rem);position:relative;overflow:hidden;animation:fadeUp .5s ease both;cursor:default;transition:border-color .25s,box-shadow .25s }
  .db-mc:hover{ border-color:#2a2a3a;box-shadow:0 0 24px rgba(0,0,0,.4) }
  .db-mc-bar{ position:absolute;top:0;left:0;right:0;height:2px }
  .db-mc-glow{ position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;opacity:.06;filter:blur(20px) }
  .db-mc-val{ font-family:monospace;font-size:clamp(1.2rem,2.8vw,2rem);font-weight:700;letter-spacing:-.02em;line-height:1;margin-bottom:4px }
  .db-mc-lbl{ font-size:clamp(11px,1.1vw,13px);font-weight:600;margin-bottom:3px }
  .db-mc-sub{ font-size:clamp(10px,.9vw,11px);color:#555;line-height:1.4;margin-bottom:8px }
  .db-mc-extra{ display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid #1a1a2e;margin-top:2px }
  .db-mc-extra-val{ font-family:monospace;font-size:11px;color:#888 }
  .db-mc-extra-badge{ font-family:monospace;font-size:10px;padding:1px 6px;border-radius:4px;font-weight:600 }
  .db-skel{ height:2rem;width:90px;border-radius:6px;background:linear-gradient(90deg,#1e1e2e 25%,#2a2a3a 50%,#1e1e2e 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;margin-bottom:5px }

  /* ─ panels */
  .db-panel{ background:#111;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;margin-bottom:10px }
  .db-ph   { padding:clamp(.55rem,.9vw,.8rem) clamp(.75rem,1.2vw,1.1rem);border-bottom:1px solid #1e1e2e;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px }
  .db-pt   { font-size:clamp(11px,1.1vw,13px);font-weight:700;letter-spacing:-.01em }
  .db-ps   { font-family:monospace;font-size:clamp(9px,.9vw,11px);color:#555 }
  .db-chart-insight{ padding:.45rem clamp(.75rem,1.2vw,1.1rem);font-size:clamp(10px,.9vw,11px);color:#4a4a6a;line-height:1.5;border-bottom:1px solid #0f0f1a;font-style:italic }

  /* ─ layout grids */
  .db-2col       { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px }
  .db-feed-pq    { display:grid;grid-template-columns:32fr 68fr;gap:10px;margin-bottom:10px;align-items:stretch }
  @media(max-width:900px){ .db-2col,.db-feed-pq{ grid-template-columns:1fr } }

  /* ─ SHAP chart custom tooltip */
  .shap-tt{ background:#111;border:1px solid #1e1e2e;border-radius:8px;padding:7px 10px;font-family:monospace;font-size:11px;color:#f0f0f0 }

  /* ─ live feed */
  .db-feed-row{ padding:clamp(.4rem,.7vw,.6rem) clamp(.75rem,1.2vw,1.1rem);border-bottom:1px solid #0f0f1a;display:flex;align-items:center;justify-content:space-between;gap:8px;position:relative;animation:rowSlide .3s ease both }
  .db-feed-row:last-child{ border-bottom:none }
  .db-feed-id { font-family:monospace;font-size:clamp(10px,.9vw,11px);font-weight:600 }
  .db-feed-sub{ font-family:monospace;font-size:clamp(8px,.75vw,9px);color:#555;margin-top:2px }
  .db-ping    { position:absolute;top:50%;right:clamp(.75rem,1.2vw,1.1rem);transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:#30d158;animation:ping 1.1s ease-out }
  .db-ftr     { padding:clamp(.4rem,.7vw,.5rem) clamp(.75rem,1.2vw,1.1rem);display:flex;align-items:center;gap:8px;border-top:1px solid #1e1e2e;flex-shrink:0 }
  .db-ftr span{ font-family:monospace;font-size:clamp(9px,.85vw,10px);color:#555 }

  /* ─ risk badge */
  .rb{ font-family:monospace;font-size:clamp(9px,.82vw,10px);font-weight:600;padding:2px 6px;border-radius:4px;white-space:nowrap;text-transform:uppercase;letter-spacing:.04em }

  /* ─ empty */
  .db-empty{ padding:2rem;text-align:center;font-family:monospace;font-size:11px;color:#555 }

  /* ── Priority queue ────────────────────────────────── */
  .pq-bar{ padding:.5rem .85rem;border-bottom:1px solid #1e1e2e;display:flex;align-items:center;gap:8px;flex-shrink:0;background:#0d0d15 }
  .pq-search{ background:#111;border:1px solid #252535;border-radius:7px;padding:5px 10px;color:#f0f0f0;font-family:monospace;font-size:11px;outline:none;flex:1;transition:border-color .2s }
  .pq-search:focus{ border-color:#555 }
  .pq-search::placeholder{ color:#333 }
  .pq-count{ font-family:monospace;font-size:10px;color:#444;flex-shrink:0 }
  .pq-tbl{ width:100%;border-collapse:collapse }
  .pq-tbl th{ position:sticky;top:0;z-index:2;background:#0a0a12;font-family:monospace;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:.1em;font-weight:500;text-align:left;padding:.5rem .75rem;border-bottom:1px solid #1e1e2e;white-space:nowrap }
  .pq-tbl td{ padding:.45rem .75rem;border-bottom:1px solid #0f0f1a;white-space:nowrap;vertical-align:middle;font-size:clamp(10px,.85vw,12px) }
  .pq-tbl tr:last-child td{ border-bottom:none }
  .pq-tbl tbody tr{ cursor:pointer;transition:background .1s }
  .pq-tbl tbody tr:hover td{ background:rgba(255,255,255,.035) }

  /* ── Modal ─────────────────────────────────────────── */
  .modal-overlay{ position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:1rem }
  .modal-box{ background:#0f0f1a;border:1px solid #2a2a3a;border-radius:16px;width:100%;max-width:500px;max-height:85vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.8);animation:modalIn .18s ease both }
  .modal-hdr{ padding:1rem 1.25rem;border-bottom:1px solid #1e1e2e;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#0f0f1a;z-index:1 }
  .modal-close{ background:#1a1a2e;border:1px solid #2a2a3a;border-radius:6px;color:#666;cursor:pointer;padding:4px 10px;font-family:monospace;font-size:11px;transition:all .15s }
  .modal-close:hover{ color:#f0f0f0;border-color:#444 }
  .modal-sec{ padding:1rem 1.25rem;border-bottom:1px solid #1a1a2e }
  .modal-sec:last-child{ border-bottom:none }
  .modal-sec-title{ font-family:monospace;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.65rem }
  .modal-grid{ display:grid;grid-template-columns:1fr 1fr;gap:8px }
  .modal-stat{ background:#0a0a0f;border:1px solid #1a1a2e;border-radius:8px;padding:8px 12px }
  .modal-stat-lbl{ font-family:monospace;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px }
  .modal-stat-val{ font-family:monospace;font-size:13px;font-weight:600;color:#f0f0f0 }

  /* ── Customer search (Tab 1) — live stream powered ─── */
  .cs-root   { display:flex;flex-direction:column;height:calc(100vh - 155px);min-height:420px }
  .cs-header { padding:.75rem 1rem;border-bottom:1px solid #1a1a2e;display:flex;align-items:center;gap:8px;background:#0d0d15;flex-shrink:0;flex-wrap:wrap }
  .cs-search { background:#111;border:1px solid #252535;border-radius:8px;padding:7px 12px 7px 32px;color:#f0f0f0;font-family:monospace;font-size:12px;outline:none;flex:1;min-width:160px;transition:border-color .2s;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:10px center }
  .cs-search:focus{ border-color:#3a3a5a }
  .cs-search::placeholder{ color:#333 }
  .cs-filter { background:#111;border:1px solid #252535;border-radius:8px;padding:7px 10px;color:#888;font-family:monospace;font-size:11px;outline:none;cursor:pointer;transition:border-color .2s }
  .cs-filter:focus{ border-color:#3a3a5a }

  /* live indicator in header */
  .cs-live-pill{ display:flex;align-items:center;gap:5px;font-family:monospace;font-size:10px;color:#30d158;background:#30d15812;border:1px solid #30d15828;border-radius:999px;padding:3px 9px;flex-shrink:0 }
  .cs-count{ font-family:monospace;font-size:10px;color:#444;margin-left:auto;flex-shrink:0 }

  .cs-tbl-wrap{ flex:1;overflow-y:auto;overflow-x:auto;minHeight:0 }
  .cs-tbl{ width:100%;border-collapse:collapse }
  .cs-tbl thead{ position:sticky;top:0;z-index:1 }
  .cs-tbl th{ background:#0a0a12;font-family:monospace;font-size:9px;color:#3a3a5a;text-transform:uppercase;letter-spacing:.12em;font-weight:500;text-align:left;padding:.65rem 1rem;border-bottom:1px solid #1a1a2e;white-space:nowrap;user-select:none }
  .cs-tbl th.s{ cursor:pointer }
  .cs-tbl th.s:hover{ color:#666 }
  .cs-tbl th.active{ color:#888 }
  .cs-tbl td{ padding:.6rem 1rem;border-bottom:1px solid #0f0f1a;vertical-align:middle;white-space:nowrap }
  .cs-tbl tr:last-child td{ border-bottom:none }
  .cs-tbl tbody tr{ transition:background .1s;cursor:default }
  .cs-tbl tbody tr:hover td{ background:rgba(255,255,255,.022) }
  .cs-tbl tbody tr.new-row td{ animation:rowSlide .4s ease both }

  .cs-id  { font-family:monospace;font-size:12px;font-weight:600;color:#e0e0e0;letter-spacing:.03em }
  .cs-mono{ font-family:monospace;font-size:12px;color:#666 }
  .cs-contract{ font-family:monospace;font-size:10px;padding:2px 7px;border-radius:4px;white-space:nowrap }
  .cs-m2m{ background:#ff3b3b0a;color:#ff6b6b;border:1px solid #ff3b3b1a }
  .cs-one{ background:#ff95000a;color:#ffaa30;border:1px solid #ff95001a }
  .cs-two{ background:#30d1580a;color:#30d158;border:1px solid #30d1581a }
  .cs-shap{ display:flex;align-items:center;gap:6px }
  .cs-shap-feat{ font-family:monospace;font-size:10px;color:#666;min-width:90px }
  .cs-shap-track{ width:40px;height:3px;background:#1e1e2e;border-radius:3px;flex-shrink:0 }
  .cs-shap-num{ font-family:monospace;font-size:9px;color:#444 }
  .cs-rec{ font-family:monospace;font-size:10px;color:#0af;max-width:200px;overflow:hidden;text-overflow:ellipsis }

  .cs-footer{ display:flex;align-items:center;justify-content:space-between;padding:.6rem 1rem;border-top:1px solid #1a1a2e;flex-shrink:0;background:#0d0d15 }
  .cs-footer span{ font-family:monospace;font-size:10px;color:#444 }
  .cs-pg{ background:#1a1a2e;border:1px solid #252535;border-radius:5px;color:#666;font-family:monospace;font-size:10px;padding:4px 10px;cursor:pointer;transition:all .15s }
  .cs-pg:hover:not(:disabled){ background:#252535;color:#aaa }
  .cs-pg:disabled{ opacity:.25;cursor:not-allowed }
  .cs-pg-n{ font-family:monospace;font-size:10px;color:#555 }

  /* ── Predict tab ──────────────────────────── */
  .db-pred-grid{ display:grid;grid-template-columns:1fr 1fr;gap:10px }
  @media(max-width:860px){ .db-pred-grid{ grid-template-columns:1fr } }
  .db-field-grid{ display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:1rem }
  .db-field    { display:flex;flex-direction:column;gap:4px }
  .db-field-lbl{ font-size:11px;color:#555;font-family:monospace }
  .db-field-inp{ background:#0a0a0f;border:1px solid #1e1e2e;border-radius:7px;padding:6px 10px;color:#f0f0f0;font-family:monospace;font-size:12px;outline:none;width:100%;transition:border-color .2s }
  .db-field-inp:focus{ border-color:#333 }
  .db-pred-btn{ margin:0 1rem 1rem;padding:11px;background:#ff3b3b;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;width:calc(100% - 2rem);transition:opacity .2s,transform .2s;font-family:inherit }
  .db-pred-btn:hover:not(:disabled){ opacity:.88;transform:translateY(-1px) }
  .db-pred-btn:disabled{ opacity:.4;cursor:not-allowed }
  .db-result-box{ margin:0 1rem 1rem;background:#0a0a0f;border:1px solid #1e1e2e;border-radius:10px;padding:1rem }
  .db-result-top{ display:flex;align-items:center;gap:1rem;margin-bottom:.85rem;padding-bottom:.75rem;border-bottom:1px solid #1e1e2e }
  .db-result-prob{ font-family:monospace;font-size:2.6rem;font-weight:700;line-height:1 }
  .db-result-lbl { font-size:13px;font-weight:600;margin-bottom:3px }
  .db-result-sub { font-size:11px;color:#666;margin-bottom:6px }
  .db-shap-title { font-size:10px;font-family:monospace;color:#555;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem }
  .db-result-shap-row{ display:flex;align-items:center;gap:8px;margin-bottom:8px }
  .db-result-shap-lbl{ font-size:11px;color:#ccc;width:130px;flex-shrink:0 }
  .db-result-shap-bg{ flex:1;height:5px;background:#1e1e2e;border-radius:4px }
  .db-result-shap-dir{ font-size:10px;font-family:monospace;width:85px;text-align:right;flex-shrink:0 }
  .db-result-rec{ margin-top:.75rem;padding:.5rem .75rem;border:1px solid #0af3;border-radius:7px;font-family:monospace;font-size:11px;color:#0af;line-height:1.5;background:rgba(0,170,255,.03) }
`;

// ════════════════════════════════════════════════════════════════════════════
// SHARED
// ════════════════════════════════════════════════════════════════════════════
function RiskBadge({ level, prob }: { level: string; prob: number }) {
  const color = rc(level);
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
// ENHANCED METRIC CARDS
// ════════════════════════════════════════════════════════════════════════════
function MetricCard({
  value,
  label,
  sub,
  color,
  loading,
  delay = 0,
  extra,
  extraLabel,
  badge,
  badgeColor,
}: {
  value: string;
  label: string;
  sub: string;
  color: string;
  loading?: boolean;
  delay?: number;
  extra?: string;
  extraLabel?: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="db-mc" style={{ animationDelay: `${delay}s` }}>
      <div className="db-mc-bar" style={{ background: color }} />
      <div className="db-mc-glow" style={{ background: color }} />
      {loading ? (
        <div className="db-skel" />
      ) : (
        <div className="db-mc-val" style={{ color }}>
          {value}
        </div>
      )}
      <div className="db-mc-lbl">{label}</div>
      <div className="db-mc-sub">{sub}</div>
      {(extra || badge) && !loading && (
        <div className="db-mc-extra">
          {extra && (
            <span className="db-mc-extra-val">
              {extraLabel}: {extra}
            </span>
          )}
          {badge && (
            <span
              className="db-mc-extra-badge"
              style={{
                color: badgeColor || color,
                background: (badgeColor || color) + "15",
                border: `1px solid ${badgeColor || color}30`,
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL
// ════════════════════════════════════════════════════════════════════════════
function CustomerModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const maxImp = Math.max(
    ...(customer.shap_reasons?.map((r) => Math.abs(r.shap_impact)) ?? [1]),
  );
  const color = rc(customer.risk_level);
  const prob = Math.round(customer.churn_probability * 100);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
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
        <div className="modal-sec">
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
                fontSize: 9,
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
            >
              Churn probability
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 26,
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
              background: "#1a1a2e",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 8,
                borderRadius: 999,
                width: `${prob}%`,
                background: `linear-gradient(90deg,${color}66,${color})`,
                transition: "width .6s ease",
              }}
            />
          </div>
        </div>
        <div className="modal-sec">
          <div className="modal-sec-title">Plan & account</div>
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
              { label: "Risk", value: customer.risk_level.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="modal-stat">
                <div className="modal-stat-lbl">{label}</div>
                <div className="modal-stat-val">{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-sec">
          <div className="modal-sec-title">SHAP drivers</div>
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
                  background: "#1a1a2e",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 6,
                    borderRadius: 4,
                    width: `${Math.min((Math.abs(r.shap_impact) / maxImp) * 100, 100)}%`,
                    background:
                      r.direction === "increases risk" ? "#ff3b3b" : "#30d158",
                    transition: "width .6s",
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
        {customer.recommendation && (
          <div className="modal-sec">
            <div className="modal-sec-title">Recommended action</div>
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

// SHAP custom tooltip
function ShapTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="shap-tt">
      <div style={{ color: "#888", marginBottom: 3 }}>{d.feature}</div>
      <div>
        Impact:{" "}
        <span
          style={{
            color: d.importance > 0.5 ? "#ff3b3b" : "#ff9500",
            fontWeight: 700,
          }}
        >
          {d.importance.toFixed(4)}
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 0 — OVERVIEW
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
  const [selected, setSelected] = useState<Customer | null>(null);
  const [pqSearch, setPqSearch] = useState("");

  const allPQ = priority.filter((c) =>
    ["critical", "high", "medium"].includes(c.risk_level),
  );
  const pqRows = allPQ.filter(
    (c) =>
      !pqSearch.trim() ||
      c.customer_id.toLowerCase().includes(pqSearch.trim().toLowerCase()),
  );

  // Prepare SHAP data for BarChart (horizontal)
  const shapData = features
    .slice(0, 8)
    .map((f) => ({
      feature: f.feature.length > 16 ? f.feature.slice(0, 15) + "…" : f.feature,
      fullName: f.feature,
      importance: f.importance,
    }))
    .reverse(); // reverse so highest is at top

  const trendInsight =
    trend.length > 0
      ? `Churn hits ${Math.max(...trend.map((t) => t.churn_rate))}% in the first cohort and drops to ${Math.min(...trend.map((t) => t.churn_rate))}% among long-tenured customers — the first 6 months are your highest-risk window.`
      : "";
  const shapInsight =
    features.length > 0
      ? `${features[0]?.feature} is the single strongest churn signal — customers flagged by it are disproportionately likely to leave.`
      : "";

  const H = "calc(100vh - 300px)";

  // Derive extra card stats from summary + priority
  const criticalCount = priority.filter(
    (c) => c.risk_level === "critical",
  ).length;
  const highCount = priority.filter((c) => c.risk_level === "high").length;
  const avgRisk =
    priority.length > 0
      ? Math.round(
          (priority.reduce((s, c) => s + c.churn_probability, 0) /
            priority.length) *
            100,
        )
      : null;

  return (
    <>
      {selected && (
        <CustomerModal customer={selected} onClose={() => setSelected(null)} />
      )}

      {/* Enhanced metric cards */}
      <div className="db-metrics">
        <MetricCard
          value={summary ? summary.total_customers.toLocaleString() : "—"}
          label="Total customers"
          sub="In loaded dataset"
          color="#0af"
          loading={!summary}
          delay={0}
          extra={summary ? `${summary.churn_rate_pct}% churn rate` : undefined}
          extraLabel="Overall"
          badge={
            summary
              ? `${Math.round((summary.total_customers * summary.churn_rate_pct) / 100)} at risk`
              : undefined
          }
          badgeColor="#ff9500"
        />
        <MetricCard
          value={summary ? `${summary.churn_rate_pct}%` : "—"}
          label="Overall churn rate"
          sub="Actual churned in dataset"
          color="#ff3b3b"
          loading={!summary}
          delay={0.06}
          extra={summary ? `£${summary.avg_monthly_charges}/mo avg` : undefined}
          extraLabel="ARPU"
          badge={
            criticalCount > 0 ? `${criticalCount} critical now` : undefined
          }
          badgeColor="#ff3b3b"
        />
        <MetricCard
          value={summary ? gbp(summary.monthly_revenue_lost) : "—"}
          label="Monthly revenue lost"
          sub="From churned customers"
          color="#ff9500"
          loading={!summary}
          delay={0.12}
          extra={
            summary ? gbp((summary.annual_revenue_lost / 12) * 3) : undefined
          }
          extraLabel="Q1 at risk"
          badge="Per month"
          badgeColor="#ff9500"
        />
        <MetricCard
          value={summary ? gbp(summary.annual_revenue_lost) : "—"}
          label="Annual revenue at risk"
          sub="Projected from churn rate"
          color="#ff3b3b"
          loading={!summary}
          delay={0.18}
          extra={highCount > 0 ? `${highCount} high-risk` : undefined}
          extraLabel="Stream"
          badge={avgRisk !== null ? `Avg risk ${avgRisk}%` : undefined}
          badgeColor="#ff9500"
        />
        <MetricCard
          value={summary ? `£${summary.avg_monthly_charges}` : "—"}
          label="Avg monthly charge"
          sub="Across all customers"
          color="#30d158"
          loading={!summary}
          delay={0.24}
          extra={summary ? gbp(summary.avg_monthly_charges * 12) : undefined}
          extraLabel="Annual ARPU"
          badge="Per customer"
          badgeColor="#30d158"
        />
      </div>

      {/* Charts */}
      <div className="db-2col">
        {/* Trend line */}
        <div className="db-panel">
          <div className="db-ph">
            <span className="db-pt">Churn rate by tenure cohort</span>
            <span className="db-ps">% churned · /trend</span>
          </div>
          {trendInsight && (
            <div className="db-chart-insight">{trendInsight}</div>
          )}
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
                    {...TT}
                    formatter={(v: number) => [`${v}%`, "Churn rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="churn_rate"
                    stroke="#ff3b3b"
                    strokeWidth={2.5}
                    dot={{ fill: "#ff3b3b", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#ff3b3b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SHAP horizontal bar chart */}
        <div className="db-panel">
          <div className="db-ph">
            <span className="db-pt">Top churn drivers — SHAP importance</span>
            <span className="db-ps">Mean |SHAP| · /features</span>
          </div>
          {shapInsight && <div className="db-chart-insight">{shapInsight}</div>}
          <div style={{ padding: "0.5rem 0.5rem 0.5rem 0", height: 210 }}>
            {features.length === 0 ? (
              <div className="db-empty">Computing SHAP values…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={shapData}
                  layout="vertical"
                  margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
                >
                  <CartesianGrid
                    stroke="#1a1a2e"
                    strokeDasharray="3 3"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      fill: "#555",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toFixed(2)}
                  />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    width={110}
                    tick={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      fill: "#888",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ShapTooltip />} />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {shapData.map((d, i) => {
                      const max =
                        shapData[shapData.length - 1]?.importance ?? 1;
                      const ratio = d.importance / max;
                      const color =
                        ratio > 0.7
                          ? "#ff3b3b"
                          : ratio > 0.4
                            ? "#ff9500"
                            : "#0af";
                      return <Cell key={i} fill={color} fillOpacity={0.85} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Feed + Priority */}
      <div className="db-feed-pq">
        {/* Live stream */}
        <div
          className="db-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            height: H,
            minHeight: 280,
          }}
        >
          <div className="db-ph" style={{ flexShrink: 0 }}>
            <span className="db-pt">Live stream</span>
            <span
              className="db-ps"
              style={{
                color:
                  streamStatus === "live"
                    ? "#30d158"
                    : streamStatus === "error"
                      ? "#ff3b3b"
                      : "#ff9500",
              }}
            >
              {streamStatus === "live"
                ? "● /stream"
                : streamStatus === "connecting"
                  ? "◌ connecting…"
                  : "✕ error"}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {feed.length === 0 ? (
              <div className="db-empty">Waiting…</div>
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
                  <div style={{ minWidth: 0 }}>
                    <div className="db-feed-id">{c.customer_id}</div>
                    <div className="db-feed-sub">
                      {Math.round(c.tenure)}mo · £
                      {c.monthly_charges?.toFixed(0)}
                    </div>
                  </div>
                  <RiskBadge level={c.risk_level} prob={c.churn_probability} />
                  {c.customer_id === newestId && <div className="db-ping" />}
                </div>
              ))
            )}
          </div>
          <div className="db-ftr">
            <div className="db-dot-r" />
            <span>~2s per prediction</span>
          </div>
        </div>

        {/* Priority queue */}
        <div
          className="db-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            height: H,
            minHeight: 280,
          }}
        >
          <div className="db-ph" style={{ flexShrink: 0 }}>
            <span className="db-pt">Priority action queue</span>
            <span className="db-ps">
              critical · high · medium · click for details
            </span>
          </div>
          <div className="pq-bar">
            <input
              className="pq-search"
              placeholder="Search customer ID…"
              value={pqSearch}
              onChange={(e) => setPqSearch(e.target.value)}
              spellCheck={false}
            />
            <span className="pq-count">
              {pqRows.length} / {allPQ.length}
            </span>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "auto",
              minHeight: 0,
            }}
          >
            {allPQ.length === 0 ? (
              <div className="db-empty">
                Building…
                <br />
                <span
                  style={{
                    fontSize: 10,
                    color: "#333",
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  Appears as stream scores customers
                </span>
              </div>
            ) : pqRows.length === 0 ? (
              <div className="db-empty">No match for "{pqSearch}"</div>
            ) : (
              <table className="pq-tbl">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Customer ID",
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
                  {pqRows.map((c, i) => {
                    const top =
                      c.shap_reasons?.find(
                        (r) => r.direction === "increases risk",
                      ) ?? c.shap_reasons?.[0];
                    const q = pqSearch.trim().toLowerCase();
                    const id = c.customer_id;
                    const idx = q ? id.toLowerCase().indexOf(q) : -1;
                    return (
                      <tr
                        key={c.customer_id}
                        onClick={() => setSelected(c)}
                        style={{
                          background:
                            c.risk_level === "critical"
                              ? "rgba(255,59,59,0.025)"
                              : "transparent",
                        }}
                      >
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#444",
                            width: 24,
                          }}
                        >
                          {i + 1}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(11px,.95vw,12px)",
                            fontWeight: 600,
                            color: "#e0e0e0",
                          }}
                        >
                          {idx >= 0 ? (
                            <>
                              {id.slice(0, idx)}
                              <span
                                style={{
                                  background: "#ff950025",
                                  color: "#ffb040",
                                  borderRadius: 2,
                                  padding: "0 1px",
                                }}
                              >
                                {id.slice(idx, idx + q.length)}
                              </span>
                              {id.slice(idx + q.length)}
                            </>
                          ) : (
                            id
                          )}
                        </td>
                        <td>
                          <RiskBadge
                            level={c.risk_level}
                            prob={c.churn_probability}
                          />
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(9px,.8vw,10px)",
                            color: "#666",
                          }}
                        >
                          {c.contract}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(9px,.8vw,10px)",
                            color: "#666",
                          }}
                        >
                          {Math.round(c.tenure)}mo
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(9px,.8vw,10px)",
                            color: "#666",
                          }}
                        >
                          £{c.monthly_charges?.toFixed(2)}
                        </td>
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
                                  color: "#666",
                                  minWidth: 80,
                                }}
                              >
                                {top.feature}
                              </span>
                              <div
                                style={{
                                  width: 32,
                                  height: 3,
                                  background: "#1e1e2e",
                                  borderRadius: 3,
                                  flexShrink: 0,
                                }}
                              >
                                <div
                                  style={{
                                    height: 3,
                                    borderRadius: 3,
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
                                  color: "#444",
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
// TAB 1 — CUSTOMER SEARCH (powered by live stream data)
// ════════════════════════════════════════════════════════════════════════════
function SearchTab({ streamCustomers }: { streamCustomers: Customer[] }) {
  const [query, setQuery] = useState("");
  const [riskF, setRiskF] = useState("");
  const [contractF, setContractF] = useState("");
  const [sortKey, setSortKey] = useState<"risk" | "charges" | "tenure">("risk");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const PAGE = 15;

  const contractClass = (c: string) =>
    c === "Month-to-month"
      ? "cs-contract cs-m2m"
      : c === "One year"
        ? "cs-contract cs-one"
        : "cs-contract cs-two";

  const filtered = streamCustomers
    .filter((c) => {
      // trim + lowercase for robust search
      const q = query.trim().toLowerCase();
      return (
        (!q ||
          c.customer_id.toLowerCase().includes(q) ||
          c.contract.toLowerCase().includes(q) ||
          c.risk_level.toLowerCase().includes(q)) &&
        (!riskF || c.risk_level === riskF) &&
        (!contractF || c.contract === contractF)
      );
    })
    .sort((a, b) => {
      const g = (x: Customer) =>
        sortKey === "risk"
          ? x.churn_probability
          : sortKey === "charges"
            ? x.monthly_charges
            : x.tenure;
      return sortDir === "desc" ? g(b) - g(a) : g(a) - g(b);
    });

  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const pages = Math.ceil(filtered.length / PAGE);
  const tog = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
    setPage(0);
  };
  const arr = (k: typeof sortKey) =>
    sortKey === k ? (sortDir === "desc" ? " ↓" : " ↑") : "";

  return (
    <div className="db-panel cs-root">
      {/* Toolbar */}
      <div className="cs-header">
        <input
          className="cs-search"
          placeholder="Search by customer ID, contract, risk…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          spellCheck={false}
        />
        <select
          className="cs-filter"
          value={riskF}
          onChange={(e) => {
            setRiskF(e.target.value);
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
          className="cs-filter"
          value={contractF}
          onChange={(e) => {
            setContractF(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All contracts</option>
          <option value="Month-to-month">Month-to-month</option>
          <option value="One year">One year</option>
          <option value="Two year">Two year</option>
        </select>
        {/* Live indicator */}
        <div className="cs-live-pill">
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#30d158",
              animation: "pulse 2s infinite",
            }}
          />
          live stream
        </div>
        <span className="cs-count">
          {filtered.length} of {streamCustomers.length} customers
        </span>
      </div>

      {/* Table */}
      <div className="cs-tbl-wrap">
        {streamCustomers.length === 0 ? (
          <div className="db-empty" style={{ paddingTop: "3rem" }}>
            <div style={{ fontSize: 24, opacity: 0.15, marginBottom: 12 }}>
              ⚡
            </div>
            Waiting for stream data…
            <br />
            <span
              style={{
                fontSize: 10,
                color: "#333",
                display: "block",
                marginTop: 6,
              }}
            >
              Customers appear here as /stream scores them in real time
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="db-empty">No customers match your filters.</div>
        ) : (
          <table className="cs-tbl">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th
                  className={`s${sortKey === "risk" ? " active" : ""}`}
                  onClick={() => tog("risk")}
                >
                  Risk{arr("risk")}
                </th>
                <th>Contract</th>
                <th
                  className={`s${sortKey === "tenure" ? " active" : ""}`}
                  onClick={() => tog("tenure")}
                >
                  Tenure{arr("tenure")}
                </th>
                <th
                  className={`s${sortKey === "charges" ? " active" : ""}`}
                  onClick={() => tog("charges")}
                >
                  Monthly £{arr("charges")}
                </th>
                <th>Top SHAP driver</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c, i) => {
                const top = c.shap_reasons?.[0];
                // Highlight search match in customer ID
                const q = query.trim().toLowerCase();
                const id = c.customer_id;
                const idx = q ? id.toLowerCase().indexOf(q) : -1;
                return (
                  <tr key={c.customer_id}>
                    <td>
                      <span className="cs-id">
                        {idx >= 0 ? (
                          <>
                            {id.slice(0, idx)}
                            <span
                              style={{
                                background: "#ff950025",
                                color: "#ffb040",
                                borderRadius: 2,
                                padding: "0 1px",
                              }}
                            >
                              {id.slice(idx, idx + q.length)}
                            </span>
                            {id.slice(idx + q.length)}
                          </>
                        ) : (
                          id
                        )}
                      </span>
                    </td>
                    <td>
                      <RiskBadge
                        level={c.risk_level}
                        prob={c.churn_probability}
                      />
                    </td>
                    <td>
                      <span className={contractClass(c.contract)}>
                        {c.contract}
                      </span>
                    </td>
                    <td>
                      <span className="cs-mono">{Math.round(c.tenure)}mo</span>
                    </td>
                    <td>
                      <span className="cs-mono">
                        £{c.monthly_charges?.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      {top ? (
                        <div className="cs-shap">
                          <span className="cs-shap-feat">{top.feature}</span>
                          <div className="cs-shap-track">
                            <div
                              style={{
                                height: 3,
                                borderRadius: 3,
                                width: `${Math.min(Math.abs(top.shap_impact) * 60, 100)}%`,
                                background:
                                  top.direction === "increases risk"
                                    ? "#ff3b3b"
                                    : "#30d158",
                              }}
                            />
                          </div>
                          <span className="cs-shap-num">
                            {top.shap_impact > 0 ? "+" : ""}
                            {top.shap_impact.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className="cs-rec">
                        {c.recommendation ? `→ ${c.recommendation}` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="cs-footer">
        <span>
          {streamCustomers.length === 0
            ? "Waiting for stream…"
            : `Showing ${paged.length} of ${filtered.length} · ${streamCustomers.length} total scored`}
        </span>
        {pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              className="cs-pg"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="cs-pg-n">
              {page + 1} / {pages}
            </span>
            <button
              className="cs-pg"
              disabled={page === pages - 1}
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
// TAB 2 — PREDICT
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
  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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

  const run = async () => {
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
                  className="db-field-inp"
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setF(f.key, e.target.value)}
                >
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="db-field-inp"
                  type={f.type ?? "text"}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setF(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <button className="db-pred-btn" onClick={run} disabled={loading}>
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
                style={{ color: rc(result.risk_level) }}
              >
                {Math.round(result.churn_probability * 100)}%
              </div>
              <div>
                <div className="db-result-lbl">Churn probability</div>
                <div className="db-result-sub">
                  Risk:{" "}
                  <span
                    style={{ color: rc(result.risk_level), fontWeight: 700 }}
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
            <div className="db-shap-title">SHAP breakdown</div>
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
// ROOT
// ════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [tab, setTab] = useState<Tab>(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [feed, setFeed] = useState<Customer[]>([]);
  const [priority, setPriority] = useState<Customer[]>([]);
  const [newestId, setNewestId] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [streamStatus, setStreamStatus] = useState<
    "connecting" | "live" | "error"
  >("connecting");

  // ALL customers ever scored by stream — feeds BOTH priority queue AND Tab 1 search
  const seen = useRef<Map<string, Customer>>(new Map());
  // Separate sorted list for Tab 1 (all customers, not filtered)
  const [allStreamCustomers, setAllStreamCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const stamp = () => setLastUpdated(new Date().toLocaleTimeString());
    fetch(`${API}/summary`)
      .then((r) => r.json())
      .then((d) => {
        setSummary(d);
        stamp();
      })
      .catch(console.error);
    fetch(`${API}/trend`)
      .then((r) => r.json())
      .then((d) => setTrend(d.trend ?? []))
      .catch(console.error);
    fetch(`${API}/features`)
      .then((r) => r.json())
      .then((d) => setFeatures(d.features ?? []))
      .catch(console.error);
    // Also seed Tab 1 with /customers so it's not empty before stream fills
    fetch(`${API}/customers?limit=100`)
      .then((r) => r.json())
      .then((d) => {
        const cs: Customer[] = d.customers ?? [];
        cs.forEach((c) => {
          if (!seen.current.has(c.customer_id))
            seen.current.set(c.customer_id, c);
        });
        setAllStreamCustomers(
          [...seen.current.values()].sort(
            (a, b) => b.churn_probability - a.churn_probability,
          ),
        );
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const es = new EventSource(`${API}/stream`);
    es.onopen = () => setStreamStatus("live");
    es.onerror = () => setStreamStatus("error");
    es.onmessage = (e) => {
      try {
        const c: Customer = JSON.parse(e.data);
        if (!c || (c as any).error) return;
        setNewestId(c.customer_id);
        setLastUpdated(new Date().toLocaleTimeString());

        // Update live feed (last 8)
        setFeed((prev) => [c, ...prev].slice(0, 8));

        // Update the seen map — used by BOTH priority queue and Tab 1
        seen.current.set(c.customer_id, c);
        const sorted = [...seen.current.values()].sort(
          (a, b) => b.churn_probability - a.churn_probability,
        );

        // Priority queue (all risk levels in state, OverviewTab filters)
        setPriority(sorted);

        // Tab 1 customer table (all scored customers)
        setAllStreamCustomers(sorted);
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, []);

  const sbStyle = {
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
            <span className="db-sbadge" style={sbStyle}>
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
                {/* Show live count badge on tab 1 */}
                {i === 1 && allStreamCustomers.length > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontFamily: "monospace",
                      fontSize: 9,
                      background: "#30d15820",
                      color: "#30d158",
                      border: "1px solid #30d15830",
                      borderRadius: 999,
                      padding: "0 5px",
                    }}
                  >
                    {allStreamCustomers.length}
                  </span>
                )}
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
        {tab === 1 && <SearchTab streamCustomers={allStreamCustomers} />}
        {tab === 2 && <PredictTab />}
      </div>
    </>
  );
}
