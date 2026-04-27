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

export default function SocialProof() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "8rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "0%",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(255,59,59,0.05) 0%, transparent 70%)",
          zIndex: 0,
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
        {/* header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "#30d15818",
              border: "1px solid #30d15833",
              borderRadius: 999,
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#30d158",
              }}
            >
              proven results
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            Numbers that speak
            <br />
            <span style={{ color: "#30d158" }}>for themselves.</span>
          </h2>
        </div>

        {/* metric cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: "3rem",
          }}
        >
          {METRICS.map((m) => (
            <div
              key={m.label}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--bg-border)",
                borderRadius: 16,
                padding: "2rem 2.5rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
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
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(2rem, 3vw, 2.8rem)",
                  fontWeight: 700,
                  color: m.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: "0.75rem",
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        {/* before vs after — redesigned */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 1fr",
              borderBottom: "1px solid var(--bg-border)",
            }}
          >
            <div style={{ padding: "1.25rem 1.5rem" }} />
            <div
              style={{
                padding: "1.25rem 2rem",
                borderLeft: "1px solid var(--bg-border)",
                background: "#ff3b3b08",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--red)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--red)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Without ChurnRadar
              </span>
            </div>
            <div
              style={{
                padding: "1.25rem 2rem",
                borderLeft: "1px solid var(--bg-border)",
                background: "#30d15808",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#30d158",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "#30d158",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                With ChurnRadar
              </span>
            </div>
          </div>

          {/* rows */}
          {COMPARISONS.map((row, i) => (
            <div
              key={row.topic}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 1fr",
                borderBottom:
                  i < COMPARISONS.length - 1
                    ? "1px solid var(--bg-border)"
                    : "none",
              }}
            >
              {/* topic label */}
              <div
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {row.topic}
                </span>
              </div>

              {/* before */}
              <div
                style={{
                  padding: "1.5rem 2rem",
                  borderLeft: "1px solid var(--bg-border)",
                  background: "#ff3b3b05",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--red-dim)",
                    border: "1px solid #ff3b3b33",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 11,
                    color: "var(--red)",
                  }}
                >
                  ✕
                </div>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {row.before}
                </span>
              </div>

              {/* after */}
              <div
                style={{
                  padding: "1.5rem 2rem",
                  borderLeft: "1px solid var(--bg-border)",
                  background: "#30d15805",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#30d15818",
                    border: "1px solid #30d15844",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 11,
                    color: "#30d158",
                  }}
                >
                  ✓
                </div>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--text-primary)",
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  {row.after}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
