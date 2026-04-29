/**
 * Dashboard.tsx — ChurnRadar
 * Changes:
 *  - Back button in nav → navigates to "/"
 *  - Priority queue "Action" col shows smart action derived from recommendation/risk
 *  - Modal prominently shows recommendation
 *  - Tab 2 (Customer search) mobile responsive
 *  - Tab 3 (Predict) completely redesigned — grouped sections, clean result panel
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const RC: Record<string, string> = {
  critical: "#ff3b3b",
  high: "#ff6b35",
  medium: "#ff9500",
  low: "#30d158",
};
const rc = (l: string) => RC[l] ?? "#888";
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

// Derive a short action label from recommendation text or risk level
function deriveAction(customer: Customer): string {
  const rec = customer.recommendation?.toLowerCase() ?? "";
  if (rec.includes("call")) return "📞 Call today";
  if (rec.includes("email") || rec.includes("send")) return "✉ Send email";
  if (rec.includes("onboard")) return "🎯 Onboard check";
  if (rec.includes("discount") || rec.includes("offer"))
    return "💰 Offer discount";
  if (rec.includes("bundle") || rec.includes("upsell"))
    return "📦 Upsell bundle";
  if (rec.includes("monitor")) return "👀 Monitor";
  // fallback by risk
  if (customer.risk_level === "critical") return "📞 Call today";
  if (customer.risk_level === "high") return "✉ Reach out";
  return "👀 Monitor";
}

// ════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════
const STYLES = `
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes ping    { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.4);opacity:0} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes modalIn { from{opacity:0;transform:scale(.97) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes rowSlide{ from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  *, *::before, *::after { box-sizing:border-box }
  html,body{ margin:0;padding:0 }

  .db {
    padding: clamp(.6rem,1.2vw,1rem) clamp(.6rem,1.5vw,1.5rem);
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--bg,#0a0a0f);
    color: #f0f0f0;
    font-family: var(--font-display,system-ui,sans-serif);
  }

  /* ─ Header */
  .db-hdr   { display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;flex-wrap:wrap;gap:6px;flex-shrink:0 }
  .db-hdr-l { display:flex;align-items:center;gap:8px }
  .db-back  { display:flex;align-items:center;gap:5px;background:transparent;border:1px solid #1e1e2e;border-radius:7px;color:#666;cursor:pointer;padding:4px 10px;font-family:monospace;font-size:10px;transition:all .2s;text-decoration:none }
  .db-back:hover{ border-color:#333;color:#aaa;background:#1a1a2e }
  .db-title { font-size:clamp(12px,1.3vw,14px);font-weight:800;letter-spacing:-0.03em }
  .db-dot   { width:7px;height:7px;border-radius:50%;background:#30d158;animation:pulse 2s infinite;flex-shrink:0 }
  .db-dot-r { width:5px;height:5px;border-radius:50%;background:#ff3b3b;animation:pulse 1.5s infinite;flex-shrink:0 }
  .db-badge { font-family:monospace;font-size:10px;padding:2px 7px;border-radius:999px;background:#30d15818;border:1px solid #30d15833;color:#30d158 }
  .db-time  { font-family:monospace;font-size:10px;color:#555 }
  .db-sbadge{ font-family:monospace;font-size:10px;padding:2px 7px;border-radius:999px }

  /* ─ Tabs */
  .db-tabs{ display:flex;gap:3px;margin-bottom:.5rem;background:#111;border:1px solid #1e1e2e;border-radius:8px;padding:3px;width:fit-content;flex-shrink:0 }
  .db-tab { padding:4px 13px;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#555;transition:all .2s;white-space:nowrap;font-family:inherit }
  .db-tab.on{ background:#1e1e2e;color:#f0f0f0 }
  .db-tab:hover:not(.on){ color:#aaa }

  /* ─ Metric cards */
  .db-metrics{ display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-bottom:.5rem;flex-shrink:0 }
  .db-mc    { background:#111;border:1px solid #1e1e2e;border-radius:9px;padding:.55rem .75rem;position:relative;overflow:hidden;animation:fadeUp .45s ease both }
  .db-mc:hover{ border-color:#2a2a3a }
  .db-mc-bar{ position:absolute;top:0;left:0;right:0;height:2px }
  .db-mc-val{ font-family:monospace;font-size:clamp(.95rem,1.8vw,1.35rem);font-weight:700;letter-spacing:-.02em;line-height:1;margin-bottom:2px }
  .db-mc-lbl{ font-size:clamp(9px,.9vw,11px);font-weight:600;margin-bottom:1px }
  .db-mc-sub{ font-size:clamp(8px,.75vw,9px);color:#555;line-height:1.3 }
  .db-mc-foot{ display:flex;align-items:center;justify-content:space-between;margin-top:4px;padding-top:4px;border-top:1px solid #1a1a2e }
  .db-mc-foot-lbl{ font-family:monospace;font-size:8px;color:#444 }
  .db-mc-pill{ font-family:monospace;font-size:8px;padding:1px 5px;border-radius:3px;font-weight:600 }
  .db-skel  { height:1.35rem;width:65px;border-radius:4px;background:linear-gradient(90deg,#1e1e2e 25%,#2a2a3a 50%,#1e1e2e 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;margin-bottom:2px }

  /* ─ Overview layout */
  .ov-layout{ display:grid;grid-template-columns:1fr 1fr;gap:7px;flex:1;min-height:0;overflow:hidden }
  .ov-left  { display:flex;flex-direction:column;gap:7px;min-height:0;overflow:hidden }
  .ov-panel { background:#111;border:1px solid #1e1e2e;border-radius:9px;overflow:hidden;display:flex;flex-direction:column;flex:1;min-height:0 }
  .ov-ph    { padding:.4rem .75rem;border-bottom:1px solid #1e1e2e;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:6px }
  .ov-pt    { font-size:clamp(9px,.85vw,11px);font-weight:700;letter-spacing:-.01em }
  .ov-ps    { font-family:monospace;font-size:clamp(8px,.7vw,9px);color:#555 }
  .ov-insight{ padding:.25rem .75rem;font-size:clamp(8px,.7vw,9px);color:#3a3a5a;font-style:italic;line-height:1.4;border-bottom:1px solid #0f0f1a;flex-shrink:0 }
  .ov-chart-wrap{ flex:1;min-height:0;padding:.2rem .1rem .2rem 0;overflow:hidden }
  .ov-feed-scroll{ flex:1;overflow-y:auto;min-height:0 }
  .ov-feed-row{ padding:.3rem .75rem;border-bottom:1px solid #0f0f1a;display:flex;align-items:center;justify-content:space-between;gap:6px;position:relative;animation:rowSlide .3s ease both }
  .ov-feed-row:last-child{ border-bottom:none }
  .ov-feed-id { font-family:monospace;font-size:clamp(9px,.8vw,10px);font-weight:600 }
  .ov-feed-sub{ font-family:monospace;font-size:clamp(7px,.65vw,8px);color:#555;margin-top:1px }
  .ov-ping    { position:absolute;top:50%;right:.75rem;transform:translateY(-50%);width:5px;height:5px;border-radius:50%;background:#30d158;animation:ping 1.1s ease-out }
  .ov-ftr     { padding:.3rem .75rem;display:flex;align-items:center;gap:5px;border-top:1px solid #1e1e2e;flex-shrink:0 }
  .ov-ftr span{ font-family:monospace;font-size:clamp(7px,.65vw,8px);color:#555 }

  /* ─ Priority queue */
  .ov-right { display:flex;flex-direction:column;min-height:0;overflow:hidden;background:#111;border:1px solid #1e1e2e;border-radius:9px }
  .pq-hdr   { padding:.4rem .75rem;border-bottom:1px solid #1e1e2e;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:6px }
  .pq-pt    { font-size:clamp(9px,.85vw,11px);font-weight:700;letter-spacing:-.01em }
  .pq-ps    { font-family:monospace;font-size:clamp(7px,.7vw,9px);color:#555 }
  .pq-bar   { padding:.35rem .6rem;border-bottom:1px solid #1e1e2e;display:flex;align-items:center;gap:6px;flex-shrink:0;background:#0d0d15 }
  .pq-srch  { background:#111;border:1px solid #252535;border-radius:5px;padding:4px 8px;color:#f0f0f0;font-family:monospace;font-size:10px;outline:none;flex:1;transition:border-color .2s }
  .pq-srch:focus{ border-color:#555 }
  .pq-srch::placeholder{ color:#333 }
  .pq-cnt   { font-family:monospace;font-size:9px;color:#444;white-space:nowrap }
  .pq-scroll{ flex:1;overflow-y:auto;overflow-x:auto;min-height:0 }
  .pq-tbl   { width:100%;border-collapse:collapse }
  .pq-tbl th{ position:sticky;top:0;z-index:2;background:#0a0a12;font-family:monospace;font-size:8px;color:#444;text-transform:uppercase;letter-spacing:.1em;font-weight:500;text-align:left;padding:.38rem .6rem;border-bottom:1px solid #1e1e2e;white-space:nowrap }
  .pq-tbl td{ padding:.35rem .6rem;border-bottom:1px solid #0a0a12;white-space:nowrap;vertical-align:middle;font-size:clamp(8px,.75vw,10px) }
  .pq-tbl tr:last-child td{ border-bottom:none }
  .pq-tbl tbody tr{ cursor:pointer;transition:background .1s }
  .pq-tbl tbody tr:hover td{ background:rgba(255,255,255,.035) }
  /* Action badge in PQ */
  .pq-action{ font-family:monospace;font-size:clamp(8px,.7vw,9px);white-space:nowrap;padding:2px 6px;border-radius:4px;background:#1a1a2e;color:#888;border:1px solid #252535 }
  .pq-action.urgent{ background:#ff3b3b12;color:#ff6b6b;border-color:#ff3b3b22 }
  .pq-action.reach { background:#ff95000d;color:#ffaa30;border-color:#ff95001a }
  .pq-action.watch { background:#30d1580a;color:#30d158;border-color:#30d1581a }

  /* ─ Risk badge */
  .rb{ font-family:monospace;font-size:clamp(8px,.72vw,9px);font-weight:600;padding:2px 5px;border-radius:3px;white-space:nowrap;text-transform:uppercase;letter-spacing:.04em }

  /* ─ Modal */
  .modal-overlay{ position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:1rem }
  .modal-box{ background:#0f0f1a;border:1px solid #2a2a3a;border-radius:14px;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.8);animation:modalIn .18s ease both }
  .modal-hdr{ padding:.85rem 1.1rem;border-bottom:1px solid #1e1e2e;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#0f0f1a;z-index:1 }
  .modal-close{ background:#1a1a2e;border:1px solid #2a2a3a;border-radius:5px;color:#666;cursor:pointer;padding:3px 9px;font-family:monospace;font-size:11px;transition:all .15s }
  .modal-close:hover{ color:#f0f0f0;border-color:#444 }
  .modal-sec{ padding:.85rem 1.1rem;border-bottom:1px solid #1a1a2e }
  .modal-sec:last-child{ border-bottom:none }
  .modal-sec-title{ font-family:monospace;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.55rem }
  .modal-grid{ display:grid;grid-template-columns:1fr 1fr;gap:7px }
  .modal-stat{ background:#0a0a0f;border:1px solid #1a1a2e;border-radius:7px;padding:7px 10px }
  .modal-stat-lbl{ font-family:monospace;font-size:8px;color:#444;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px }
  .modal-stat-val{ font-family:monospace;font-size:12px;font-weight:600;color:#f0f0f0 }
  /* Big recommendation box in modal */
  .modal-rec{ background:rgba(0,170,255,.05);border:1px solid rgba(0,170,255,.2);border-radius:9px;padding:.85rem 1rem;font-family:monospace;font-size:12px;color:#0af;line-height:1.7;display:flex;align-items:flex-start;gap:10px }
  .modal-rec-icon{ font-size:18px;flex-shrink:0;margin-top:-1px }

  /* ─ Empty */
  .db-empty{ padding:1.5rem;text-align:center;font-family:monospace;font-size:10px;color:#555 }

  /* ════ Customer search (Tab 1) ════ */
  .cs-root  { display:flex;flex-direction:column;flex:1;min-height:0;background:#111;border:1px solid #1e1e2e;border-radius:10px;overflow:hidden }
  .cs-header{ display:flex;align-items:center;gap:7px;padding:.55rem .85rem;border-bottom:1px solid #1a1a2e;background:#0d0d15;flex-shrink:0;flex-wrap:wrap }
  .cs-search{ background:#111;border:1px solid #252535;border-radius:7px;padding:6px 10px 6px 27px;color:#f0f0f0;font-family:monospace;font-size:11px;outline:none;flex:1;min-width:140px;transition:border-color .2s;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:9px center }
  .cs-search:focus{ border-color:#3a3a5a }
  .cs-search::placeholder{ color:#333 }
  .cs-filter{ background:#111;border:1px solid #252535;border-radius:7px;padding:6px 8px;color:#888;font-family:monospace;font-size:10px;outline:none;cursor:pointer }
  .cs-filter:focus{ border-color:#3a3a5a }
  .cs-live-pill{ display:flex;align-items:center;gap:4px;font-family:monospace;font-size:9px;color:#30d158;background:#30d15812;border:1px solid #30d15828;border-radius:999px;padding:2px 7px;flex-shrink:0 }
  .cs-count{ font-family:monospace;font-size:10px;color:#444;margin-left:auto;flex-shrink:0 }
  .cs-tbl-wrap{ flex:1;overflow-y:auto;overflow-x:auto;min-height:0 }
  .cs-tbl  { width:100%;border-collapse:collapse }
  .cs-tbl thead{ position:sticky;top:0;z-index:1 }
  .cs-tbl th{ background:#0a0a12;font-family:monospace;font-size:9px;color:#3a3a5a;text-transform:uppercase;letter-spacing:.12em;font-weight:500;text-align:left;padding:.55rem .85rem;border-bottom:1px solid #1a1a2e;white-space:nowrap;user-select:none }
  .cs-tbl th.s{ cursor:pointer }
  .cs-tbl th.s:hover{ color:#666 }
  .cs-tbl th.active{ color:#888 }
  .cs-tbl td{ padding:.52rem .85rem;border-bottom:1px solid #0f0f1a;vertical-align:middle;white-space:nowrap }
  .cs-tbl tr:last-child td{ border-bottom:none }
  .cs-tbl tbody tr:hover td{ background:rgba(255,255,255,.022) }
  .cs-id  { font-family:monospace;font-size:11px;font-weight:600;color:#e0e0e0;letter-spacing:.03em }
  .cs-mono{ font-family:monospace;font-size:11px;color:#666 }
  .cs-pill{ font-family:monospace;font-size:9px;padding:2px 6px;border-radius:3px;white-space:nowrap }
  .cs-m2m { background:#ff3b3b0a;color:#ff6b6b;border:1px solid #ff3b3b1a }
  .cs-one { background:#ff95000a;color:#ffaa30;border:1px solid #ff95001a }
  .cs-two { background:#30d1580a;color:#30d158;border:1px solid #30d1581a }
  .cs-shap{ display:flex;align-items:center;gap:5px }
  .cs-shap-feat{ font-family:monospace;font-size:9px;color:#666;min-width:80px }
  .cs-shap-track{ width:36px;height:3px;background:#1e1e2e;border-radius:3px;flex-shrink:0 }
  .cs-shap-num{ font-family:monospace;font-size:8px;color:#444 }
  .cs-rec { font-family:monospace;font-size:9px;color:#0af;max-width:180px;overflow:hidden;text-overflow:ellipsis }
  .cs-footer{ display:flex;align-items:center;justify-content:space-between;padding:.45rem .85rem;border-top:1px solid #1a1a2e;flex-shrink:0;background:#0d0d15 }
  .cs-footer span{ font-family:monospace;font-size:10px;color:#444 }
  .cs-pg{ background:#1a1a2e;border:1px solid #252535;border-radius:4px;color:#666;font-family:monospace;font-size:10px;padding:3px 8px;cursor:pointer;transition:all .15s }
  .cs-pg:hover:not(:disabled){ background:#252535;color:#aaa }
  .cs-pg:disabled{ opacity:.22;cursor:not-allowed }
  .cs-pg-n{ font-family:monospace;font-size:10px;color:#555 }

  /* ════ Predict tab — redesigned ════ */
  .pred-root{ display:flex;flex-direction:column;flex:1;min-height:0;gap:0;overflow:auto }
  .pred-grid{ display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1;min-height:0 }

  /* Form panel */
  .pred-form{ background:#111;border:1px solid #1e1e2e;border-radius:10px;overflow:hidden;display:flex;flex-direction:column }
  .pred-form-hdr{ padding:.6rem .9rem;border-bottom:1px solid #1e1e2e;display:flex;align-items:center;justify-content:space-between;flex-shrink:0 }
  .pred-form-hdr-title{ font-size:12px;font-weight:700 }
  .pred-form-hdr-sub{ font-family:monospace;font-size:10px;color:#555 }
  .pred-body{ flex:1;overflow-y:auto;padding:.6rem .9rem;display:flex;flex-direction:column;gap:.85rem }

  /* Section groups inside form */
  .pred-section{ display:flex;flex-direction:column;gap:6px }
  .pred-section-title{ font-family:monospace;font-size:9px;color:#444;text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px;display:flex;align-items:center;gap:6px }
  .pred-section-title::after{ content:'';flex:1;height:1px;background:#1a1a2e }
  .pred-row{ display:grid;grid-template-columns:1fr 1fr;gap:7px }
  .pred-row.three{ grid-template-columns:1fr 1fr 1fr }
  .pred-row.full  { grid-template-columns:1fr }
  .pred-field{ display:flex;flex-direction:column;gap:3px }
  .pred-label{ font-size:10px;color:#555;font-family:monospace }
  .pred-input{
    background:#0a0a0f;
    border:1px solid #1e1e2e;
    border-radius:6px;
    padding:6px 9px;
    color:#f0f0f0;
    font-family:monospace;
    font-size:11px;
    outline:none;
    width:100%;
    transition:border-color .2s,background .2s;
    appearance:none;
  }
  .pred-input:focus{ border-color:#3a3a5a;background:#0f0f18 }
  .pred-input:hover{ border-color:#2a2a3a }
  .pred-submit-area{ padding:.65rem .9rem;border-top:1px solid #1e1e2e;flex-shrink:0 }
  .pred-btn{
    width:100%;padding:10px;
    background:#ff3b3b;border:none;border-radius:7px;
    color:#fff;font-size:12px;font-weight:700;cursor:pointer;
    font-family:inherit;letter-spacing:-.01em;
    transition:opacity .2s,transform .15s,box-shadow .2s;
    display:flex;align-items:center;justify-content:center;gap:6px;
  }
  .pred-btn:hover:not(:disabled){ opacity:.88;transform:translateY(-1px);box-shadow:0 6px 20px rgba(255,59,59,.3) }
  .pred-btn:disabled{ opacity:.4;cursor:not-allowed;transform:none;box-shadow:none }
  .pred-btn-spinner{ width:13px;height:13px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite }
  @keyframes spin{ to{transform:rotate(360deg)} }

  /* Result panel */
  .pred-result{ background:#111;border:1px solid #1e1e2e;border-radius:10px;overflow:hidden;display:flex;flex-direction:column }
  .pred-result-hdr{ padding:.6rem .9rem;border-bottom:1px solid #1e1e2e;display:flex;align-items:center;justify-content:space-between;flex-shrink:0 }
  .pred-result-body{ flex:1;overflow-y:auto;padding:.75rem .9rem;display:flex;flex-direction:column;gap:.85rem }

  /* Score display */
  .pred-score-wrap{ display:flex;align-items:center;gap:1rem;padding:.85rem;background:#0a0a0f;border:1px solid #1e1e2e;border-radius:9px }
  .pred-score-num { font-family:monospace;font-size:2.8rem;font-weight:700;line-height:1;min-width:90px }
  .pred-score-right{ flex:1 }
  .pred-score-lbl { font-size:12px;font-weight:700;margin-bottom:3px }
  .pred-score-risk { font-size:10px;color:#888;margin-bottom:8px }
  .pred-prob-bar  { height:6px;background:#1e1e2e;border-radius:999px;overflow:hidden }
  .pred-prob-fill { height:6px;border-radius:999px;transition:width .7s cubic-bezier(.22,1,.36,1) }

  /* SHAP mini chart */
  .pred-shap-row  { display:flex;align-items:center;gap:8px;margin-bottom:7px }
  .pred-shap-lbl  { font-family:monospace;font-size:10px;color:#ccc;width:120px;flex-shrink:0 }
  .pred-shap-bg   { flex:1;height:5px;background:#1e1e2e;border-radius:4px }
  .pred-shap-dir  { font-family:monospace;font-size:9px;width:75px;text-align:right;flex-shrink:0 }
  .pred-rec-box   { padding:.65rem .85rem;background:rgba(0,170,255,.04);border:1px solid rgba(0,170,255,.18);border-radius:8px;font-family:monospace;font-size:11px;color:#0af;line-height:1.6;display:flex;gap:8px;align-items:flex-start }
  .pred-placeholder{ display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:10px;color:#444;text-align:center;padding:2rem }
  .pred-placeholder-icon{ font-size:36px;opacity:.12 }
  .pred-placeholder-text{ font-family:monospace;font-size:11px;line-height:1.7;color:#444 }
  .pred-error{ padding:1rem;font-family:monospace;font-size:11px;color:#ff6b6b;word-break:break-all;background:#ff3b3b08;border-radius:7px;border:1px solid #ff3b3b1a }

  /* ════ MOBILE ════ */
  @media(max-width:768px){
    html,body{ overflow:auto }
    .db{ height:auto;overflow:visible;padding:.75rem }
    .db-metrics{ grid-template-columns:repeat(2,1fr) }
    .ov-layout{ grid-template-columns:1fr;height:auto;overflow:visible }
    .ov-left  { overflow:visible;height:auto }
    .ov-panel { flex:none;height:220px }
    .ov-right { height:380px }
    .cs-root  { height:calc(100vh - 120px) }
    .pred-root{ overflow:visible }
    .pred-grid{ grid-template-columns:1fr;height:auto }
    .pred-form{ max-height:none }
    .pred-result{ min-height:400px }
    .pred-row.three{ grid-template-columns:1fr 1fr }
    .db-hdr   { gap:4px }
  }
  @media(max-width:480px){
    .db-metrics{ grid-template-columns:repeat(2,1fr) }
    .cs-header{ gap:5px }
    .cs-filter{ display:none }
    .pred-row { grid-template-columns:1fr }
    .pred-row.three{ grid-template-columns:1fr }
  }
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

function MetricCard({
  value,
  label,
  sub,
  color,
  loading,
  delay = 0,
  foot,
  footBadge,
  footBadgeColor,
}: {
  value: string;
  label: string;
  sub: string;
  color: string;
  loading?: boolean;
  delay?: number;
  foot?: string;
  footBadge?: string;
  footBadgeColor?: string;
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
      {(foot || footBadge) && !loading && (
        <div className="db-mc-foot">
          {foot && <span className="db-mc-foot-lbl">{foot}</span>}
          {footBadge && (
            <span
              className="db-mc-pill"
              style={{
                color: footBadgeColor || color,
                background: (footBadgeColor || color) + "18",
                border: `1px solid ${footBadgeColor || color}30`,
              }}
            >
              {footBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL — with prominent recommendation
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
  const action = deriveAction(customer);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hdr">
          <div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                fontWeight: 700,
                color: "#f0f0f0",
                marginBottom: 4,
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
        <div className="modal-sec">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 7,
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
              height: 7,
              background: "#1a1a2e",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 7,
                borderRadius: 999,
                width: `${prob}%`,
                background: `linear-gradient(90deg,${color}66,${color})`,
                transition: "width .6s",
              }}
            />
          </div>
        </div>

        {/* Recommendation — most prominent */}
        <div className="modal-sec">
          <div className="modal-sec-title">Recommended action</div>
          <div className="modal-rec">
            <span className="modal-rec-icon">⚡</span>
            <div>
              <div
                style={{ fontWeight: 700, marginBottom: 4, color: "#7ad4ff" }}
              >
                {action}
              </div>
              <div style={{ color: "#0af", fontSize: 11, lineHeight: 1.7 }}>
                {customer.recommendation ||
                  "Contact this customer based on their risk profile and top churn drivers."}
              </div>
            </div>
          </div>
        </div>

        {/* Plan details */}
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

        {/* SHAP */}
        <div className="modal-sec">
          <div className="modal-sec-title">SHAP churn drivers</div>
          {customer.shap_reasons?.map((r) => (
            <div
              key={r.feature}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 9,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "#ccc",
                  width: 130,
                  flexShrink: 0,
                }}
              >
                {r.feature}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 5,
                  background: "#1a1a2e",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 5,
                    borderRadius: 4,
                    width: `${Math.min((Math.abs(r.shap_impact) / maxImp) * 100, 100)}%`,
                    background:
                      r.direction === "increases risk" ? "#ff3b3b" : "#30d158",
                    transition: "width .5s",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  width: 60,
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
      </div>
    </div>
  );
}

// SHAP tooltip
function ShapTT({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #1e1e2e",
        borderRadius: 7,
        padding: "6px 9px",
        fontFamily: "monospace",
        fontSize: 10,
        color: "#f0f0f0",
      }}
    >
      <div style={{ color: "#888", marginBottom: 2 }}>{d.fullName}</div>
      <div>
        Impact:{" "}
        <span
          style={{
            color:
              d.importance > 0.5
                ? "#ff3b3b"
                : d.importance > 0.3
                  ? "#ff9500"
                  : "#0af",
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

  const shapData = features
    .slice(0, 7)
    .map((f) => ({
      feature: f.feature.length > 14 ? f.feature.slice(0, 13) + "…" : f.feature,
      fullName: f.feature,
      importance: f.importance,
    }))
    .reverse();
  const maxImp = features[0]?.importance ?? 1;

  const trendInsight =
    trend.length > 0
      ? `Churn peaks at ${Math.max(...trend.map((t) => t.churn_rate))}% in early cohorts — the first 6 months are your highest-risk window.`
      : "";
  const shapInsight =
    features.length > 0
      ? `${features[0]?.feature} is the dominant churn signal, followed by ${features[1]?.feature}.`
      : "";

  const critCount = priority.filter((c) => c.risk_level === "critical").length;
  const highCount = priority.filter((c) => c.risk_level === "high").length;
  const avgRisk =
    priority.length > 0
      ? Math.round(
          (priority.reduce((s, c) => s + c.churn_probability, 0) /
            priority.length) *
            100,
        )
      : null;

  // Action badge class
  const actionClass = (c: Customer) => {
    if (c.risk_level === "critical") return "pq-action urgent";
    if (c.risk_level === "high") return "pq-action reach";
    return "pq-action watch";
  };

  return (
    <>
      {selected && (
        <CustomerModal customer={selected} onClose={() => setSelected(null)} />
      )}

      <div className="db-metrics">
        <MetricCard
          value={summary ? summary.total_customers.toLocaleString() : "—"}
          label="Total customers"
          sub="In dataset"
          color="#0af"
          loading={!summary}
          delay={0}
          foot={summary ? `${summary.churn_rate_pct}% churn` : undefined}
          footBadge={critCount > 0 ? `${critCount} critical` : undefined}
          footBadgeColor="#ff3b3b"
        />
        <MetricCard
          value={summary ? `${summary.churn_rate_pct}%` : "—"}
          label="Churn rate"
          sub="Actual churned"
          color="#ff3b3b"
          loading={!summary}
          delay={0.05}
          foot={highCount > 0 ? `${highCount} high-risk flagged` : undefined}
          footBadge={avgRisk !== null ? `avg ${avgRisk}%` : undefined}
          footBadgeColor="#ff9500"
        />
        <MetricCard
          value={summary ? gbp(summary.monthly_revenue_lost) : "—"}
          label="Monthly lost"
          sub="From churned"
          color="#ff9500"
          loading={!summary}
          delay={0.1}
          foot={summary ? `£${summary.avg_monthly_charges} avg` : undefined}
          footBadge="Per month"
          footBadgeColor="#ff9500"
        />
        <MetricCard
          value={summary ? gbp(summary.annual_revenue_lost) : "—"}
          label="Annual at risk"
          sub="Projected"
          color="#ff3b3b"
          loading={!summary}
          delay={0.15}
          foot="12-month projection"
          footBadge={allPQ.length > 0 ? `${allPQ.length} flagged` : undefined}
          footBadgeColor="#ff9500"
        />
        <MetricCard
          value={summary ? `£${summary.avg_monthly_charges}` : "—"}
          label="Avg charge"
          sub="Per customer/month"
          color="#30d158"
          loading={!summary}
          delay={0.2}
          foot="Monthly ARPU"
          footBadge={
            summary ? gbp(summary.avg_monthly_charges * 12) + " /yr" : undefined
          }
          footBadgeColor="#30d158"
        />
      </div>

      <div className="ov-layout">
        {/* Left column */}
        <div className="ov-left">
          {/* 1. Trend */}
          <div className="ov-panel">
            <div className="ov-ph">
              <span className="ov-pt">Churn rate by tenure cohort</span>
              <span className="ov-ps">% churned · /trend</span>
            </div>
            {trendInsight && <div className="ov-insight">{trendInsight}</div>}
            <div className="ov-chart-wrap">
              {trend.length === 0 ? (
                <div className="db-empty">Loading…</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trend}
                    margin={{ top: 6, right: 12, bottom: 0, left: -20 }}
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
                        fontSize: 8,
                        fill: "#555",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontFamily: "monospace",
                        fontSize: 8,
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
                      strokeWidth={2}
                      dot={{ fill: "#ff3b3b", r: 2.5, strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 2. SHAP */}
          <div className="ov-panel">
            <div className="ov-ph">
              <span className="ov-pt">Top churn drivers — SHAP importance</span>
              <span className="ov-ps">Mean |SHAP| · /features</span>
            </div>
            {shapInsight && <div className="ov-insight">{shapInsight}</div>}
            <div className="ov-chart-wrap">
              {features.length === 0 ? (
                <div className="db-empty">Computing SHAP…</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={shapData}
                    layout="vertical"
                    margin={{ top: 4, right: 32, bottom: 4, left: 6 }}
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
                        fontSize: 8,
                        fill: "#555",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v.toFixed(2)}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      width={96}
                      tick={{
                        fontFamily: "monospace",
                        fontSize: 8,
                        fill: "#888",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ShapTT />} />
                    <Bar dataKey="importance" radius={[0, 3, 3, 0]}>
                      {shapData.map((d, i) => {
                        const r = d.importance / maxImp;
                        return (
                          <Cell
                            key={i}
                            fill={
                              r > 0.7 ? "#ff3b3b" : r > 0.4 ? "#ff9500" : "#0af"
                            }
                            fillOpacity={0.85}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 3. Live feed */}
          <div className="ov-panel">
            <div className="ov-ph">
              <span className="ov-pt">Live prediction stream</span>
              <span
                className="ov-ps"
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
            <div className="ov-feed-scroll">
              {feed.length === 0 ? (
                <div className="db-empty">Waiting…</div>
              ) : (
                feed.map((c) => (
                  <div
                    key={`${c.customer_id}-${c.churn_probability}`}
                    className="ov-feed-row"
                    style={{
                      background:
                        c.risk_level === "critical"
                          ? "rgba(255,59,59,0.03)"
                          : "transparent",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div className="ov-feed-id">{c.customer_id}</div>
                      <div className="ov-feed-sub">
                        {c.contract} · {Math.round(c.tenure)}mo · £
                        {c.monthly_charges?.toFixed(0)}/mo
                      </div>
                    </div>
                    <RiskBadge
                      level={c.risk_level}
                      prob={c.churn_probability}
                    />
                    {c.customer_id === newestId && <div className="ov-ping" />}
                  </div>
                ))
              )}
            </div>
            <div className="ov-ftr">
              <div className="db-dot-r" />
              <span>New prediction every ~2 seconds</span>
            </div>
          </div>
        </div>

        {/* Right column — priority queue */}
        <div className="ov-right">
          <div className="pq-hdr">
            <span className="pq-pt">Priority action queue</span>
            <span className="pq-ps">
              critical · high · medium · click row for details
            </span>
          </div>
          <div className="pq-bar">
            <input
              className="pq-srch"
              placeholder="Search customer ID…"
              value={pqSearch}
              onChange={(e) => setPqSearch(e.target.value)}
              spellCheck={false}
            />
            <span className="pq-cnt">
              {pqRows.length} / {allPQ.length}
            </span>
          </div>
          <div className="pq-scroll">
            {allPQ.length === 0 ? (
              <div className="db-empty">
                Building from stream…
                <br />
                <span
                  style={{
                    fontSize: 9,
                    color: "#333",
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  Medium / high / critical appear here
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
                      "Customer",
                      "Risk",
                      "Contract",
                      "Tenure",
                      "£/mo",
                      "Top driver",
                      "Action",
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
                    const action = deriveAction(c);
                    const aClass = actionClass(c);
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
                            fontSize: 9,
                            color: "#444",
                            width: 20,
                          }}
                        >
                          {i + 1}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(9px,.85vw,11px)",
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
                            fontSize: "clamp(8px,.7vw,10px)",
                            color: "#666",
                          }}
                        >
                          {c.contract}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(8px,.7vw,10px)",
                            color: "#666",
                          }}
                        >
                          {Math.round(c.tenure)}mo
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "clamp(8px,.7vw,10px)",
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
                                gap: 5,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 9,
                                  color: "#666",
                                  minWidth: 65,
                                }}
                              >
                                {top.feature}
                              </span>
                              <div
                                style={{
                                  width: 26,
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
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        {/* Action column — derived from recommendation */}
                        <td>
                          <span className={aClass}>{action}</span>
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
// TAB 1 — CUSTOMER SEARCH
// ════════════════════════════════════════════════════════════════════════════
function SearchTab({ streamCustomers }: { streamCustomers: Customer[] }) {
  const [query, setQuery] = useState("");
  const [riskF, setRiskF] = useState("");
  const [contractF, setContractF] = useState("");
  const [sortKey, setSortKey] = useState<"risk" | "charges" | "tenure">("risk");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const PAGE = 15;

  const cClass = (c: string) =>
    c === "Month-to-month"
      ? "cs-pill cs-m2m"
      : c === "One year"
        ? "cs-pill cs-one"
        : "cs-pill cs-two";

  const filtered = streamCustomers
    .filter((c) => {
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
    <div className="cs-root">
      <div className="cs-header">
        <input
          className="cs-search"
          placeholder="Search by customer ID, contract, risk level…"
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
          <option value="">All risk</option>
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
        <div className="cs-live-pill">
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#30d158",
              animation: "pulse 2s infinite",
            }}
          />
          live
        </div>
        <span className="cs-count">
          {filtered.length} / {streamCustomers.length}
        </span>
      </div>
      <div className="cs-tbl-wrap">
        {streamCustomers.length === 0 ? (
          <div className="db-empty" style={{ paddingTop: "3rem" }}>
            <div style={{ fontSize: 28, opacity: 0.1, marginBottom: 10 }}>
              ⚡
            </div>
            Waiting for stream data…
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
              {paged.map((c) => {
                const top = c.shap_reasons?.[0];
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
                      <span className={cClass(c.contract)}>{c.contract}</span>
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
      <div className="cs-footer">
        <span>
          {streamCustomers.length === 0
            ? "Waiting for stream…"
            : `${paged.length} of ${filtered.length} · ${streamCustomers.length} total scored`}
        </span>
        {pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <button
              className="cs-pg"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="cs-pg-n">
              {page + 1}/{pages}
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
// TAB 2 — PREDICT (redesigned)
// ════════════════════════════════════════════════════════════════════════════

// Form field definition
const FORM_SECTIONS = [
  {
    title: "Personal",
    rows: [
      [
        { key: "gender", label: "Gender", options: ["Male", "Female"] },
        {
          key: "SeniorCitizen",
          label: "Senior citizen",
          options: ["No", "Yes"],
        },
        { key: "Partner", label: "Partner", options: ["Yes", "No"] },
        { key: "Dependents", label: "Dependents", options: ["Yes", "No"] },
      ],
    ],
  },
  {
    title: "Account",
    rows: [
      [
        { key: "tenure", label: "Tenure (months)", type: "number" },
        { key: "MonthlyCharges", label: "Monthly £", type: "number" },
        { key: "TotalCharges", label: "Total £", type: "number" },
      ],
      [
        {
          key: "Contract",
          label: "Contract",
          options: ["Month-to-month", "One year", "Two year"],
        },
        { key: "PaperlessBilling", label: "Paperless", options: ["Yes", "No"] },
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
      ],
    ],
  },
  {
    title: "Services",
    rows: [
      [
        { key: "PhoneService", label: "Phone", options: ["Yes", "No"] },
        {
          key: "MultipleLines",
          label: "Multi-line",
          options: ["No", "Yes", "No phone service"],
        },
        {
          key: "InternetService",
          label: "Internet",
          options: ["Fiber optic", "DSL", "No"],
        },
      ],
      [
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
          label: "Device protect",
          options: ["No", "Yes", "No internet service"],
        },
      ],
      [
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
      ],
    ],
  },
];

const DEFAULT_FORM: Record<string, string> = {
  gender: "Male",
  SeniorCitizen: "No",
  Partner: "No",
  Dependents: "No",
  tenure: "2",
  MonthlyCharges: "94.50",
  TotalCharges: "189.00",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "No",
  StreamingMovies: "No",
};

function PredictTab() {
  const [form, setForm] = useState<Record<string, string>>(DEFAULT_FORM);
  const [result, setResult] = useState<Customer | null>(null);
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState("");

  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const run = async () => {
    setLoad(true);
    setError("");
    setResult(null);
    try {
      const body: Record<string, string | number> = { ...form };
      // Convert SeniorCitizen Yes/No → 1/0
      body.SeniorCitizen = form.SeniorCitizen === "Yes" ? 1 : 0;
      ["tenure", "MonthlyCharges", "TotalCharges"].forEach((k) => {
        body[k] = parseFloat(form[k]) || 0;
      });
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
      setLoad(false);
    }
  };

  const maxShap = result
    ? Math.max(...result.shap_reasons.map((r) => Math.abs(r.shap_impact)))
    : 1;
  const prob = result ? Math.round(result.churn_probability * 100) : 0;
  const color = result ? rc(result.risk_level) : "#555";

  return (
    <div className="pred-root">
      <div className="pred-grid">
        {/* ── Form ── */}
        <div className="pred-form">
          <div className="pred-form-hdr">
            <span className="pred-form-hdr-title">Customer details</span>
            <span className="pred-form-hdr-sub">POST → /predict</span>
          </div>

          <div className="pred-body">
            {FORM_SECTIONS.map((section) => (
              <div className="pred-section" key={section.title}>
                <div className="pred-section-title">{section.title}</div>
                {section.rows.map((row, ri) => (
                  <div
                    className={`pred-row${row.length === 3 ? " three" : row.length === 1 ? " full" : ""}`}
                    key={ri}
                  >
                    {row.map((f: any) => (
                      <div className="pred-field" key={f.key}>
                        <span className="pred-label">{f.label}</span>
                        {f.options ? (
                          <select
                            className="pred-input"
                            value={form[f.key]}
                            onChange={(e) => setF(f.key, e.target.value)}
                          >
                            {f.options.map((o: string) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="pred-input"
                            type={f.type ?? "text"}
                            value={form[f.key]}
                            onChange={(e) => setF(f.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="pred-submit-area">
            <button className="pred-btn" onClick={run} disabled={loading}>
              {loading ? (
                <>
                  <div className="pred-btn-spinner" />
                  Scoring…
                </>
              ) : (
                <>Run prediction →</>
              )}
            </button>
          </div>
        </div>

        {/* ── Result ── */}
        <div className="pred-result">
          <div className="pred-result-hdr">
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              Prediction result
            </span>
            <span
              style={{ fontFamily: "monospace", fontSize: 10, color: "#555" }}
            >
              {result
                ? `scored · ${result.customer_id}`
                : loading
                  ? "scoring…"
                  : "waiting for input…"}
            </span>
          </div>

          {!result && !error && !loading && (
            <div className="pred-placeholder">
              <div className="pred-placeholder-icon">⚡</div>
              <div className="pred-placeholder-text">
                Fill in the customer details
                <br />
                and click{" "}
                <strong style={{ color: "#f0f0f0" }}>Run prediction</strong>
                <br />
                to get their churn score.
              </div>
            </div>
          )}

          {loading && (
            <div className="pred-placeholder">
              <div
                className="pred-btn-spinner"
                style={{ width: 24, height: 24, borderWidth: 3 }}
              />
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#555",
                  marginTop: 8,
                }}
              >
                Running model…
              </div>
            </div>
          )}

          {error && !loading && (
            <div style={{ padding: "1rem" }}>
              <div className="pred-error">{error}</div>
            </div>
          )}

          {result && !loading && (
            <div className="pred-result-body">
              {/* Score gauge */}
              <div className="pred-score-wrap">
                <div className="pred-score-num" style={{ color }}>
                  {prob}%
                </div>
                <div className="pred-score-right">
                  <div className="pred-score-lbl">Churn probability</div>
                  <div className="pred-score-risk" style={{ marginBottom: 6 }}>
                    Risk level:{" "}
                    <span
                      style={{
                        color,
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    >
                      {result.risk_level.toUpperCase()}
                    </span>
                    &nbsp;&nbsp;
                    <RiskBadge
                      level={result.risk_level}
                      prob={result.churn_probability}
                    />
                  </div>
                  <div className="pred-prob-bar">
                    <div
                      className="pred-prob-fill"
                      style={{
                        width: `${prob}%`,
                        background: `linear-gradient(90deg,${color}70,${color})`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 7,
                }}
              >
                {[
                  { label: "Contract", value: result.contract },
                  { label: "Tenure", value: `${Math.round(result.tenure)}mo` },
                  {
                    label: "Monthly £",
                    value: `£${result.monthly_charges?.toFixed(2)}`,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "#0a0a0f",
                      border: "1px solid #1e1e2e",
                      borderRadius: 7,
                      padding: "7px 10px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 8,
                        color: "#444",
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        marginBottom: 3,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#f0f0f0",
                      }}
                    >
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* SHAP */}
              <div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "#444",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    marginBottom: 8,
                  }}
                >
                  Why this score — SHAP breakdown
                </div>
                {result.shap_reasons.map((r) => (
                  <div className="pred-shap-row" key={r.feature}>
                    <span className="pred-shap-lbl">{r.feature}</span>
                    <div className="pred-shap-bg">
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
                      className="pred-shap-dir"
                      style={{
                        color:
                          r.direction === "increases risk"
                            ? "#ff3b3b"
                            : "#30d158",
                      }}
                    >
                      {r.direction === "increases risk"
                        ? "↑ increases"
                        : "↓ decreases"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              {result.recommendation && (
                <div className="pred-rec-box">
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚡</span>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#7ad4ff",
                        marginBottom: 4,
                        fontFamily: "monospace",
                      }}
                    >
                      {deriveAction(result)}
                    </div>
                    <div>{result.recommendation}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [feed, setFeed] = useState<Customer[]>([]);
  const [priority, setPriority] = useState<Customer[]>([]);
  const [allStreamCustomers, setAll] = useState<Customer[]>([]);
  const [newestId, setNewestId] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [streamStatus, setStreamStatus] = useState<
    "connecting" | "live" | "error"
  >("connecting");
  const seen = useRef<Map<string, Customer>>(new Map());

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
    fetch(`${API}/customers?limit=100`)
      .then((r) => r.json())
      .then((d) => {
        const cs: Customer[] = d.customers ?? [];
        cs.forEach((c) => {
          if (!seen.current.has(c.customer_id))
            seen.current.set(c.customer_id, c);
        });
        const sorted = [...seen.current.values()].sort(
          (a, b) => b.churn_probability - a.churn_probability,
        );
        setAll(sorted);
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
        setFeed((prev) => [c, ...prev].slice(0, 10));
        seen.current.set(c.customer_id, c);
        const sorted = [...seen.current.values()].sort(
          (a, b) => b.churn_probability - a.churn_probability,
        );
        setPriority(sorted);
        setAll(sorted);
      } catch {}
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
        {/* Header */}
        <div className="db-hdr">
          <div className="db-hdr-l">
            {/* Back button → returns to landing page */}
            <button className="db-back" onClick={() => navigate("/")}>
              ← Back
            </button>
            <div className="db-dot" />
            <span className="db-title">ChurnRadar</span>
            <span className="db-badge">Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
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

        {/* Tabs */}
        <div className="db-tabs">
          {(["Overview", "Customer search", "Predict customer"] as const).map(
            (label, i) => (
              <button
                key={label}
                className={`db-tab${tab === i ? " on" : ""}`}
                onClick={() => setTab(i as Tab)}
              >
                {label}
                {i === 1 && allStreamCustomers.length > 0 && (
                  <span
                    style={{
                      marginLeft: 5,
                      fontFamily: "monospace",
                      fontSize: 8,
                      background: "#30d15820",
                      color: "#30d158",
                      border: "1px solid #30d15830",
                      borderRadius: 999,
                      padding: "0 4px",
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
