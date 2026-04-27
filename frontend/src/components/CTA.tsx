export default function CTA() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",

        position: "relative",

        padding: "clamp(2rem, 5vh, 5rem) clamp(1.5rem, 4vw, 4rem)",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* background glows */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          background:
            "radial-gradient(circle, rgba(255,59,59,0.06) 0%, transparent 65%)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
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
        {/* main CTA block */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {/* top bar */}
          <div
            style={{
              background: "var(--red)",
              padding: "0.6rem 2rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.5)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              churn_radar — live dashboard
            </span>
          </div>

          <div
            style={{
              padding: "4rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            {/* left — headline */}
            <div>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 2.8vw, 3.2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  marginBottom: "1.5rem",
                }}
              >
                Every week you wait,
                <br />
                <span style={{ color: "var(--red)" }}>
                  more customers leave
                </span>
                <br />
                without warning.
              </h2>

              <p
                style={{
                  fontSize: 16,
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  marginBottom: "2.5rem",
                  maxWidth: 440,
                }}
              >
                ChurnRadar is built and validated on real data. The model is
                live. The dashboard is ready. The only thing missing is your
                data.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: "2.5rem",
                }}
              >
                {[
                  "No data science team required",
                  "First predictions in under 10 minutes",
                  "SHAP explanations on every at-risk customer",
                  "Built on XGBoost — AUC 0.845 validated",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "var(--red-dim)",
                        border: "1px solid #ff3b3b44",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "var(--red)",
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  style={{
                    padding: "14px 32px",
                    background: "var(--red)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "transform 0.2s, opacity 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Request access →
                </button>

                <button
                  style={{
                    padding: "14px 32px",
                    background: "transparent",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 10,
                    color: "var(--text-secondary)",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#ff3b3b44";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--bg-border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  View live demo
                </button>
              </div>
            </div>

            {/* right — terminal style stats */}
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--bg-border)",
                borderRadius: 16,
                overflow: "hidden",
                fontFamily: "var(--font-mono)",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid var(--bg-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginLeft: 8,
                  }}
                >
                  model_summary.json
                </span>
              </div>

              <div style={{ padding: "1.5rem", fontSize: 13, lineHeight: 2 }}>
                {[
                  {
                    key: "model",
                    val: '"XGBoost Classifier"',
                    color: "var(--cyan)",
                  },
                  { key: "auc_score", val: "0.8455", color: "#30d158" },
                  { key: "cv_folds", val: "5", color: "#ff9500" },
                  { key: "std_deviation", val: "0.0040", color: "#30d158" },
                  { key: "threshold", val: "0.40", color: "#ff9500" },
                  {
                    key: "churners_caught",
                    val: "276 / 374",
                    color: "var(--cyan)",
                  },
                  { key: "recovery_rate", val: '"74%"', color: "#30d158" },
                  { key: "features", val: "23", color: "#ff9500" },
                  {
                    key: "explainability",
                    val: '"SHAP TreeExplainer"',
                    color: "var(--cyan)",
                  },
                  {
                    key: "status",
                    val: '"production_ready"',
                    color: "#30d158",
                  },
                ].map((row) => (
                  <div key={row.key} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--text-muted)" }}>"</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {row.key}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>":</span>
                    <span style={{ color: row.color }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom footer strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.5rem 2rem",
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: 16,
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
              }}
            >
              C
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Churn<span style={{ color: "var(--red)" }}>Radar</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "2rem",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            {[
              "Built with XGBoost + SHAP",
              "React + FastAPI",
              "Open to work",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            Built by <span style={{ color: "var(--cyan)" }}>@shaheeraslam</span>
          </div>
        </div>
      </div>
    </section>
  );
}
