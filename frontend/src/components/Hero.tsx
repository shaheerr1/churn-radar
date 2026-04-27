import { useEffect, useState } from "react";

const CUSTOMERS = [
  {
    id: "CUST-4821",
    tenure: 2,
    contract: "Month-to-month",
    charges: "£94.50",
    risk: 94,
  },
  {
    id: "CUST-1203",
    tenure: 7,
    contract: "Month-to-month",
    charges: "£78.20",
    risk: 81,
  },
  {
    id: "CUST-9341",
    tenure: 34,
    contract: "One year",
    charges: "£55.00",
    risk: 23,
  },
  {
    id: "CUST-2987",
    tenure: 1,
    contract: "Month-to-month",
    charges: "£102.30",
    risk: 97,
  },
  {
    id: "CUST-6612",
    tenure: 58,
    contract: "Two year",
    charges: "£45.80",
    risk: 4,
  },
];

function RiskBadge({ risk }: { risk: number }) {
  const color = risk >= 70 ? "#ff3b3b" : risk >= 40 ? "#ff9500" : "#30d158";
  const label = risk >= 70 ? "HIGH" : risk >= 40 ? "MED" : "LOW";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(9px, 1vw, 11px)",
        fontWeight: 500,
        color,
        padding: "2px 7px",
        background: color + "18",
        borderRadius: 4,
        border: `1px solid ${color}44`,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {label} {risk}%
    </span>
  );
}

const styles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scanline {
    0%   { top: -30%; }
    100% { top: 130%; }
  }

  .hero-section {
    display: flex;
    align-items: center;
    padding: clamp(5rem, 8vw, 8rem) clamp(1rem, 5vw, 4rem) clamp(2rem, 4vw, 4rem);
    position: relative;
    overflow: hidden;
    min-height: 100vh;
  }

  .hero-grid {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 4vw, 4rem);
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: clamp(4px, 0.7vw, 6px) clamp(10px, 1.5vw, 14px);
    background: var(--red-dim);
    border: 1px solid #ff3b3b44;
    border-radius: 999px;
    margin-bottom: clamp(0.75rem, 1.5vw, 1.5rem);
    animation: fadeUp 0.6s ease both;
    animation-delay: 0.1s;
  }
  .hero-badge span {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1.1vw, 12px);
    color: var(--red);
  }

  .hero-h1 {
    font-size: clamp(2rem, 4.5vw, 3.8rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    margin-bottom: clamp(0.75rem, 1.5vw, 1.5rem);
    animation: fadeUp 0.7s ease both;
    animation-delay: 0.2s;
  }

  .hero-p {
    font-size: clamp(13px, 1.3vw, 16px);
    color: var(--text-secondary);
    max-width: 460px;
    margin-bottom: clamp(1.25rem, 2vw, 2rem);
    line-height: 1.7;
    animation: fadeUp 0.7s ease both;
    animation-delay: 0.32s;
  }

  .hero-btns {
    display: flex;
    gap: clamp(0.5rem, 1vw, 1rem);
    flex-wrap: wrap;
    animation: fadeUp 0.7s ease both;
    animation-delay: 0.44s;
  }

  .hero-btn-primary {
    padding: clamp(10px, 1.2vw, 14px) clamp(20px, 2.5vw, 32px);
    background: var(--red);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: clamp(13px, 1.3vw, 16px);
    font-weight: 700;
    cursor: pointer;
    font-family: var(--font-display);
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s, box-shadow 0.25s;
  }
  .hero-btn-primary:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 24px rgba(255,59,59,0.35);
    opacity: 0.92;
  }

  .hero-btn-secondary {
    padding: clamp(10px, 1.2vw, 14px) clamp(20px, 2.5vw, 32px);
    background: transparent;
    border: 1px solid var(--bg-border);
    border-radius: 10px;
    color: var(--text-secondary);
    font-size: clamp(13px, 1.3vw, 16px);
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-display);
    transition: border-color 0.25s, color 0.25s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .hero-btn-secondary:hover {
    border-color: #ff3b3b44;
    color: var(--text-primary);
    transform: translateY(-2px);
  }

  .hero-stats {
    display: flex;
    gap: clamp(1.25rem, 3vw, 2.5rem);
    margin-top: clamp(1.5rem, 3vw, 3rem);
    padding-top: clamp(1.25rem, 2vw, 2rem);
    border-top: 1px solid var(--bg-border);
    animation: fadeUp 0.7s ease both;
    animation-delay: 0.56s;
  }
  .hero-stat-val {
    font-family: var(--font-mono);
    font-size: clamp(1.25rem, 2.2vw, 1.75rem);
    font-weight: 700;
    color: var(--text-primary);
  }
  .hero-stat-label {
    font-size: clamp(10px, 1vw, 13px);
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .hero-feed {
    background: var(--bg-card);
    border: 1px solid var(--bg-border);
    border-radius: clamp(12px, 1.5vw, 16px);
    overflow: hidden;
    position: relative;
    animation: slideInRight 0.8s cubic-bezier(0.22,1,0.36,1) both;
    animation-delay: 0.3s;
    transition: box-shadow 0.4s;
  }
  .hero-feed:hover {
    box-shadow: 0 0 40px rgba(255,59,59,0.06), 0 0 0 1px rgba(255,59,59,0.1);
  }

  .hero-scanline {
    position: absolute;
    left: 0; right: 0;
    height: 30%;
    background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.012) 50%, transparent 100%);
    animation: scanline 5s linear infinite;
    pointer-events: none;
    z-index: 3;
  }

  .hero-feed-hdr {
    padding: clamp(0.6rem, 1vw, 1rem) clamp(0.75rem, 1.2vw, 1.25rem);
    border-bottom: 1px solid var(--bg-border);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hero-feed-hdr span {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1vw, 12px);
    color: var(--text-secondary);
  }

  .hero-trow {
    display: grid;
    grid-template-columns: 1fr 52px 112px 72px;
    padding: 0 clamp(0.75rem, 1.2vw, 1.25rem);
    align-items: center;
  }

  .hero-thead {
    border-bottom: 1px solid var(--bg-border);
    padding-top: clamp(0.35rem, 0.6vw, 0.5rem);
    padding-bottom: clamp(0.35rem, 0.6vw, 0.5rem);
  }
  .hero-thead span {
    font-family: var(--font-mono);
    font-size: clamp(9px, 0.9vw, 11px);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .hero-tbody-row {
    border-bottom: 1px solid var(--bg-border);
    padding-top: clamp(0.45rem, 0.8vw, 0.7rem);
    padding-bottom: clamp(0.45rem, 0.8vw, 0.7rem);
    /* opacity + transform controlled via inline style */
    transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1);
  }
  .hero-tbody-row:last-child { border-bottom: none; }

  .hero-row-id {
    font-family: var(--font-mono);
    font-size: clamp(11px, 1.1vw, 13px);
    color: var(--text-primary);
    line-height: 1.3;
  }
  .hero-row-charge {
    font-family: var(--font-mono);
    font-size: clamp(9px, 0.9vw, 11px);
    color: var(--text-muted);
    line-height: 1.3;
  }
  .hero-row-tenure {
    font-family: var(--font-mono);
    font-size: clamp(11px, 1.1vw, 13px);
    color: var(--text-secondary);
  }
  .hero-row-contract {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1vw, 12px);
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .hero-feed-ftr {
    padding: clamp(0.5rem, 0.8vw, 0.75rem) clamp(0.75rem, 1.2vw, 1.25rem);
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid var(--bg-border);
  }
  .hero-feed-ftr span {
    font-family: var(--font-mono);
    font-size: clamp(9px, 0.9vw, 11px);
    color: var(--text-muted);
  }

  @media (max-width: 860px) {
    .hero-grid { grid-template-columns: 1fr; }
    .hero-feed {
      animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both;
      animation-delay: 0.5s;
    }
  }
  @media (max-width: 540px) {
    .hero-section { padding-top: clamp(4rem, 10vw, 6rem); }
    .hero-h1 br { display: none; }
    .hero-stats { gap: 1.25rem; }
    .hero-trow { grid-template-columns: 1fr 44px 92px 64px; }
  }
`;

export default function Hero() {
  // visibleCount: how many rows are currently faded in (0–5)
  const [visibleCount, setVisibleCount] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let running = true;

    const run = (step: number) => {
      if (!running) return;

      if (step <= CUSTOMERS.length) {
        // fade in one more row
        setVisibleCount(step);
        timeout = setTimeout(() => run(step + 1), 750);
      } else {
        // all shown — pause, then fade all out, then restart
        timeout = setTimeout(() => {
          if (!running) return;
          setVisibleCount(0);
          timeout = setTimeout(() => {
            if (!running) return;
            run(1);
          }, 700); // wait for fade-out to finish before restarting
        }, 2500);
      }
    };

    timeout = setTimeout(() => run(1), 600);
    return () => {
      running = false;
      clearTimeout(timeout);
    };
  }, []);

  // counter
  useEffect(() => {
    const target = 1869;
    const steps = 60;
    let current = 0;
    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(current));
    }, 1400 / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <section className="hero-section">
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `
            linear-gradient(rgba(255,59,59,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,59,59,0.025) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
            animation: "fadeIn 1.2s ease both",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "5%",
            width: "clamp(250px, 40vw, 600px)",
            height: "clamp(250px, 40vw, 600px)",
            background:
              "radial-gradient(circle, rgba(255,59,59,0.07) 0%, transparent 70%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div className="hero-grid">
          {/* ── LEFT ── */}
          <div>
            <div className="hero-badge">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--red)",
                  animation: "pulse 2s infinite",
                }}
              />
              <span>Live churn detection</span>
            </div>

            <h1 className="hero-h1">
              Stop watching
              <br />
              customers leave
              <br />
              <span style={{ color: "var(--red)" }}>in silence.</span>
            </h1>

            <p className="hero-p">
              ChurnRadar uses machine learning to identify which customers are
              about to cancel — weeks before they do — so you can act first.
            </p>

            <div className="hero-btns">
              <button className="hero-btn-primary">See it live →</button>
              <button className="hero-btn-secondary">View dashboard</button>
            </div>

            <div className="hero-stats">
              {[
                { val: count.toLocaleString(), label: "Churners identified" },
                { val: "74%", label: "Recovery rate" },
                { val: "0.82", label: "Model AUC" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="hero-stat-val">{stat.val}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — live feed ── */}
          <div className="hero-feed">
            <div className="hero-scanline" />

            <div className="hero-feed-hdr">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#30d158",
                  animation: "pulse 2s infinite",
                }}
              />
              <span>live_customer_feed.stream</span>
            </div>

            {/* thead — always visible, never changes */}
            <div className="hero-trow hero-thead">
              {["Customer", "Tenure", "Contract", "Risk"].map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>

            {/* All 5 rows always in DOM — table size never changes.
                opacity + translateY controlled by visibleCount index. */}
            {CUSTOMERS.map((c, i) => {
              const isVisible = i < visibleCount;
              return (
                <div
                  key={c.id}
                  className="hero-trow hero-tbody-row"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(10px)",
                    background:
                      c.risk >= 70 ? "rgba(255,59,59,0.03)" : "transparent",
                  }}
                >
                  <div>
                    <div className="hero-row-id">{c.id}</div>
                    <div className="hero-row-charge">{c.charges}/mo</div>
                  </div>
                  <span className="hero-row-tenure">{c.tenure}mo</span>
                  <span className="hero-row-contract">{c.contract}</span>
                  <div>
                    <RiskBadge risk={c.risk} />
                  </div>
                </div>
              );
            })}

            <div className="hero-feed-ftr">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--red)",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <span>Scoring customers in real time...</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
