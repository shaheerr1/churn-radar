const METRICS = [
  {
    value: "0.82",
    label: "Model AUC",
    sub: "Validated across 5-fold cross validation",
    color: "var(--cyan)",
  },
  {
    value: "74%",
    label: "Recovery rate",
    sub: "276 of 374 at-risk customers correctly identified",
    color: "#30d158",
  },
  {
    value: "96.4%",
    label: "Highest risk score",
    sub: "Model correctly flagged customer who churned",
    color: "var(--red)",
  },
  {
    value: "£1.7M",
    label: "Lifetime value protected",
    sub: "For a SaaS company at £200/month ARPU",
    color: "#ff9500",
  },
];

const COMPARISONS = [
  {
    topic: "Discovery",
    before: "Find out when they cancel",
    after: "Flagged 3 weeks early",
  },
  {
    topic: "Targeting",
    before: "Contact everyone blindly",
    after: "Top 20% catches 47% of churners",
  },
  {
    topic: "Insight",
    before: "No idea why they left",
    after: "SHAP explains every prediction",
  },
  {
    topic: "Revenue",
    before: "Post-mortem after loss",
    after: "Act before money walks out",
  },
];

const styles = `
  .sp-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(1.5rem, 3vw, 3rem) clamp(1rem, 5vw, 4rem);
    position: relative;
    overflow: hidden;
  }
  .sp-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(140px, 20vw, 220px), 1fr));
    gap: clamp(6px, 1vw, 12px);
    margin-bottom: clamp(1rem, 1.5vw, 1.5rem);
  }
  .sp-card {
    background: var(--bg-card);
    border: 1px solid var(--bg-border);
    border-radius: clamp(8px, 1.2vw, 14px);
    padding: clamp(0.75rem, 1.5vw, 1.25rem) clamp(0.75rem, 1.5vw, 1.5rem);
    position: relative;
    overflow: hidden;
  }
  .sp-value {
    font-family: var(--font-mono);
    font-size: clamp(1.25rem, 2.5vw, 2rem);
    font-weight: 700;
    line-height: 1;
    margin-bottom: clamp(0.3rem, 0.6vw, 0.5rem);
  }
  .sp-col-headers {
    display: grid;
    grid-template-columns: clamp(90px, 12vw, 160px) 1fr 1fr;
    border-bottom: 1px solid var(--bg-border);
  }
  .sp-comp-row {
    display: grid;
    grid-template-columns: clamp(90px, 12vw, 160px) 1fr 1fr;
    border-bottom: 1px solid var(--bg-border);
  }
  .sp-comp-row:last-child { border-bottom: none; }
  .sp-cell {
    padding: clamp(0.6rem, 1.2vw, 1rem) clamp(0.75rem, 1.5vw, 1.5rem);
    border-left: 1px solid var(--bg-border);
    display: flex;
    align-items: center;
    gap: clamp(6px, 1vw, 10px);
    font-size: clamp(11px, 1.2vw, 13px);
  }
  .sp-icon {
    width: clamp(14px, 2vw, 18px);
    height: clamp(14px, 2vw, 18px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: clamp(8px, 1vw, 10px);
  }
  @media (max-width: 540px) {
    .sp-col-headers { display: none; }
    .sp-comp-row { grid-template-columns: 1fr; padding: 0.6rem 0.75rem; gap: 0.4rem; }
    .sp-cell { border-left: none; border-radius: 6px; padding: 0.5rem 0.6rem; }
  }
`;

export default function SocialProof() {
  return (
    <>
      <style>{styles}</style>
      <section className="sp-section">
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: 0,
            width: "clamp(200px,40vw,600px)",
            height: "clamp(200px,40vw,600px)",
            background:
              "radial-gradient(circle, rgba(255,59,59,0.05) 0%, transparent 70%)",
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
          <div
            style={{
              textAlign: "center",
              marginBottom: "clamp(1rem, 2vw, 2rem)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "clamp(3px,0.8vw,5px) clamp(8px,1.5vw,12px)",
                background: "#30d15818",
                border: "1px solid #30d15833",
                borderRadius: 999,
                marginBottom: "clamp(0.5rem,1.2vw,1rem)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(10px,1.2vw,12px)",
                  color: "#30d158",
                }}
              >
                proven results
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3.5vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 0,
              }}
            >
              Numbers that speak{" "}
              <span style={{ color: "#30d158" }}>for themselves.</span>
            </h2>
          </div>

          {/* Metric Cards */}
          <div className="sp-metrics">
            {METRICS.map((m) => (
              <div key={m.label} className="sp-card">
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: m.color,
                  }}
                />
                <div className="sp-value" style={{ color: m.color }}>
                  {m.value}
                </div>
                <div
                  style={{
                    fontSize: "clamp(11px,1.2vw,14px)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "clamp(2px,0.4vw,4px)",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: "clamp(10px,1vw,12px)",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {m.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--bg-border)",
              borderRadius: "clamp(10px,1.5vw,16px)",
              overflow: "hidden",
            }}
          >
            <div className="sp-col-headers">
              <div
                style={{
                  padding:
                    "clamp(0.6rem,1.2vw,1rem) clamp(0.75rem,1.2vw,1.25rem)",
                }}
              />
              {[
                {
                  label: "Without ChurnRadar",
                  color: "var(--red)",
                  bg: "#ff3b3b08",
                },
                {
                  label: "With ChurnRadar",
                  color: "#30d158",
                  bg: "#30d15808",
                },
              ].map((h) => (
                <div
                  key={h.label}
                  style={{
                    padding:
                      "clamp(0.6rem,1.2vw,1rem) clamp(0.75rem,1.5vw,1.5rem)",
                    borderLeft: "1px solid var(--bg-border)",
                    background: h.bg,
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(5px,0.8vw,8px)",
                  }}
                >
                  <div
                    style={{
                      width: "clamp(6px,0.8vw,8px)",
                      height: "clamp(6px,0.8vw,8px)",
                      borderRadius: "50%",
                      background: h.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "clamp(9px,1vw,11px)",
                      color: h.color,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h.label}
                  </span>
                </div>
              ))}
            </div>

            {COMPARISONS.map((row, i) => (
              <div
                key={row.topic}
                className="sp-comp-row"
                style={{
                  borderBottom:
                    i < COMPARISONS.length - 1
                      ? "1px solid var(--bg-border)"
                      : "none",
                }}
              >
                <div
                  style={{
                    padding:
                      "clamp(0.6rem,1.2vw,1rem) clamp(0.75rem,1.2vw,1.25rem)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "clamp(9px,1vw,11px)",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {row.topic}
                  </span>
                </div>
                {[
                  {
                    text: row.before,
                    icon: "✕",
                    iconStyle: {
                      background: "var(--red-dim)",
                      border: "1px solid #ff3b3b33",
                      color: "var(--red)",
                    },
                    cellBg: "#ff3b3b05",
                    textColor: "var(--text-secondary)",
                    fw: 400,
                  },
                  {
                    text: row.after,
                    icon: "✓",
                    iconStyle: {
                      background: "#30d15818",
                      border: "1px solid #30d15844",
                      color: "#30d158",
                    },
                    cellBg: "#30d15805",
                    textColor: "var(--text-primary)",
                    fw: 500,
                  },
                ].map((cell) => (
                  <div
                    key={cell.text}
                    className="sp-cell"
                    style={{ background: cell.cellBg }}
                  >
                    <div className="sp-icon" style={cell.iconStyle}>
                      {cell.icon}
                    </div>
                    <span
                      style={{ color: cell.textColor, fontWeight: cell.fw }}
                    >
                      {cell.text}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
