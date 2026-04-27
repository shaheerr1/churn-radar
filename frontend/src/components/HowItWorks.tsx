const STEPS = [
  {
    number: "01",
    title: "Connect your data",
    description:
      "Feed in your customer data — usage logs, billing history, support tickets, plan details. CSV upload or direct API. No data science team needed.",
    detail: "Works with Stripe, Intercom, Mixpanel, or raw CSV exports.",
    color: "var(--cyan)",
  },
  {
    number: "02",
    title: "Model scores every customer",
    description:
      "Our XGBoost model analyses 23 behavioural and billing signals per customer and assigns a churn probability score from 0–100% — updated weekly.",
    detail:
      "AUC 0.82 — validated across 5-fold cross validation on 7,032 customers.",
    color: "var(--red)",
  },
  {
    number: "03",
    title: "Understand exactly why",
    description:
      'SHAP explainability breaks down the top reasons behind every prediction. Not just "this customer is at risk" — but "because they\'re month-to-month, paying £95, and only 2 months old."',
    detail: "Every prediction is explainable. No black boxes.",
    color: "#ff9500",
  },
  {
    number: "04",
    title: "Act before they leave",
    description:
      "A daily priority queue tells you who to contact today, ranked by risk × revenue. Each customer comes with a suggested action based on their specific churn drivers.",
    detail: "Contact the right 20% of customers to catch 47% of all churners.",
    color: "#30d158",
  },
];

const styles = `
  .hiw-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(1.5rem, 3vw, 4rem) clamp(1rem, 5vw, 4rem);
    position: relative;
    overflow: hidden;
  }

  .hiw-header {
    text-align: center;
    margin-bottom: clamp(1.25rem, 2.5vw, 2.5rem);
  }

  .hiw-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: clamp(3px, 0.6vw, 6px) clamp(8px, 1.2vw, 14px);
    background: var(--cyan-dim);
    border: 1px solid #00d4ff33;
    border-radius: 999px;
    margin-bottom: clamp(0.5rem, 1vw, 1rem);
  }

  .hiw-badge span {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1.1vw, 12px);
    color: var(--cyan);
  }

  .hiw-title {
    font-size: clamp(1.4rem, 3.2vw, 2.8rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: clamp(0.5rem, 1vw, 1rem);
  }

  .hiw-subtitle {
    font-size: clamp(13px, 1.3vw, 16px);
    color: var(--text-secondary);
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .hiw-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(8px, 1.2vw, 14px);
    margin-bottom: clamp(1rem, 1.5vw, 1.5rem);
  }

  .hiw-card {
    background: var(--bg-card);
    border: 1px solid var(--bg-border);
    border-radius: clamp(10px, 1.2vw, 14px);
    padding: clamp(0.75rem, 1.5vw, 1.5rem) clamp(0.75rem, 1.5vw, 1.5rem);
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s, transform 0.3s;
    cursor: default;
  }

  .hiw-step-number {
    font-family: var(--font-mono);
    font-weight: 700;
    line-height: 1;
    opacity: 0.15;
    letter-spacing: -0.04em;
    font-size: clamp(2rem, 3.5vw, 3.5rem);
    margin-bottom: clamp(0.4rem, 0.8vw, 0.75rem);
  }

  .hiw-card h3 {
    font-size: clamp(13px, 1.3vw, 17px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: clamp(0.4rem, 0.8vw, 0.75rem);
    color: var(--text-primary);
  }

  .hiw-card p {
    font-size: clamp(11px, 1.1vw, 13px);
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: clamp(0.5rem, 1vw, 1rem);
  }

  .hiw-detail {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: clamp(6px, 0.8vw, 10px) clamp(8px, 1vw, 12px);
    border-radius: 7px;
  }

  .hiw-detail span {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1vw, 11px);
    line-height: 1.5;
  }

  .hiw-connector {
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: clamp(18px, 2vw, 22px);
    height: clamp(18px, 2vw, 22px);
    background: var(--bg);
    border: 1px solid var(--bg-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: clamp(8px, 0.9vw, 10px);
    color: var(--text-muted);
    z-index: 2;
  }

  .hiw-bottom {
    background: var(--bg-card);
    border: 1px solid var(--bg-border);
    border-radius: clamp(10px, 1.2vw, 14px);
    padding: clamp(1rem, 1.5vw, 1.5rem) clamp(1.25rem, 2vw, 2rem);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .hiw-bottom-title {
    font-size: clamp(14px, 1.4vw, 17px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 3px;
  }

  .hiw-bottom-sub {
    font-size: clamp(11px, 1.1vw, 13px);
    color: var(--text-secondary);
  }

  .hiw-btn {
    padding: clamp(8px, 1vw, 11px) clamp(16px, 2vw, 24px);
    background: var(--cyan);
    border: none;
    border-radius: 9px;
    color: #0a0a0f;
    font-size: clamp(12px, 1.2vw, 14px);
    font-weight: 700;
    cursor: pointer;
    font-family: var(--font-display);
    transition: opacity 0.2s, transform 0.2s;
    white-space: nowrap;
  }

  /* Tablet: 2x2 grid */
  @media (max-width: 900px) {
    .hiw-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .hiw-connector {
      display: none;
    }
  }

  /* Mobile: single column */
  @media (max-width: 540px) {
    .hiw-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .hiw-card {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto auto;
      column-gap: 0.75rem;
      align-items: start;
    }
    .hiw-step-number {
      font-size: 1.5rem;
      margin-bottom: 0;
      grid-row: 1;
      grid-column: 1;
    }
    .hiw-card h3 {
      font-size: 13px;
      margin-bottom: 0.25rem;
      grid-row: 1;
      grid-column: 2;
      align-self: center;
    }
    .hiw-card p {
      font-size: 11px;
      margin-bottom: 0.4rem;
      grid-row: 2;
      grid-column: 2;
    }
    .hiw-detail {
      grid-row: 3;
      grid-column: 2;
    }
    .hiw-title br { display: none; }
    .hiw-bottom {
      flex-direction: column;
      align-items: flex-start;
    }
    .hiw-btn { width: 100%; text-align: center; }
  }
`;

export default function HowItWorks() {
  return (
    <>
      <style>{styles}</style>
      <section className="hiw-section">
        {/* cyan glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-5%",
            width: "clamp(200px, 30vw, 500px)",
            height: "clamp(200px, 30vw, 500px)",
            background:
              "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div className="hiw-header">
            <div className="hiw-badge">
              <span>how it works</span>
            </div>
            <h2 className="hiw-title">
              From raw data to <br />
              <span style={{ color: "var(--cyan)" }}>
                saved revenue in 4 steps.
              </span>
            </h2>
            <p className="hiw-subtitle">
              No data science team. No months of setup. Connect your data and
              your first predictions are ready in minutes.
            </p>
          </div>

          {/* Steps */}
          <div className="hiw-grid">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="hiw-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = step.color + "55";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--bg-border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* top accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: step.color,
                    opacity: 0.6,
                  }}
                />

                <div className="hiw-step-number" style={{ color: step.color }}>
                  {step.number}
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

                <div
                  className="hiw-detail"
                  style={{
                    background: step.color + "0f",
                    border: `1px solid ${step.color}22`,
                  }}
                >
                  <span style={{ color: step.color }}>{step.detail}</span>
                </div>

                {i < STEPS.length - 1 && <div className="hiw-connector">→</div>}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="hiw-bottom">
            <div>
              <div className="hiw-bottom-title">
                Ready to see it with your data?
              </div>
              <div className="hiw-bottom-sub">
                Takes less than 10 minutes to get your first predictions.
              </div>
            </div>
            <button
              className="hiw-btn"
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get started free →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
