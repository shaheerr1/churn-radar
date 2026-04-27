export default function CTA() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "6rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
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
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          {/* top bar */}
          <div
            style={{
              background: "var(--red)",
              padding: "0.5rem 1.5rem",
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
                fontSize: 11,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              churn_radar — live dashboard
            </span>
          </div>

          <div
            style={{
              padding: "2.5rem 3rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3rem",
              alignItems: "center",
            }}
          >
            {/* left */}
            <div>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 2.5vw, 2.6rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  marginBottom: "1rem",
                }}
              >
                Every week you wait,{" "}
                <span style={{ color: "var(--red)" }}>
                  more customers leave
                </span>{" "}
                without warning.
              </h2>

              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                  maxWidth: 420,
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
                  gap: 10,
                  marginBottom: "1.75rem",
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
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "var(--red-dim)",
                        border: "1px solid #ff3b3b44",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        color: "var(--red)",
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                    <span
                      style={{
                        fontSize: 13,
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
                    padding: "12px 28px",
                    background: "var(--red)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 14,
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
                    padding: "12px 28px",
                    background: "transparent",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 10,
                    color: "var(--text-secondary)",
                    fontSize: 14,
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

            {/* right — terminal */}
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--bg-border)",
                borderRadius: 14,
                overflow: "hidden",
                fontFamily: "var(--font-mono)",
              }}
            >
              <div
                style={{
                  padding: "0.6rem 1rem",
                  borderBottom: "1px solid var(--bg-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginLeft: 6,
                  }}
                >
                  model_summary.json
                </span>
              </div>

              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  fontSize: 12,
                  lineHeight: 1.9,
                }}
              >
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
                  <div key={row.key} style={{ display: "flex", gap: 6 }}>
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

        {/* footer strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 2rem",
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: 14,
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: "var(--red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 12,
                color: "#fff",
              }}
            >
              C
            </div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Churn<span style={{ color: "var(--red)" }}>Radar</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "2rem",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
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
              fontSize: 11,
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
