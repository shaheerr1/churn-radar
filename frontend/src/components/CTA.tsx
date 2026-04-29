import { useEffect, useState } from "react";

export default function CTA() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <section
      style={{
        minHeight: isMobile ? "auto" : "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: isMobile ? "flex-start" : "center",
        padding: isMobile ? "2rem 1rem 3rem" : "6rem 4rem",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: isMobile ? "6%" : "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: isMobile ? 360 : 800,
          height: isMobile ? 360 : 800,
          background:
            "radial-gradient(circle, rgba(255,59,59,0.06) 0%, transparent 65%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: isMobile ? 430 : 1200,
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
        }}
      >
        {/* main CTA block */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: isMobile ? 18 : 20,
            overflow: "hidden",
            marginBottom: isMobile ? 12 : 12,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* top bar */}
          <div
            style={{
              background: "var(--red)",
              padding: isMobile ? "0.7rem 1.25rem" : "0.5rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.5)",
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: isMobile ? 11 : 11,
                color: "rgba(255,255,255,0.82)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              churn_radar — live dashboard
            </span>
          </div>

          <div
            style={{
              padding: isMobile ? "2.25rem 1.25rem 2rem" : "2.5rem 3rem",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? "2rem" : "3rem",
              alignItems: "center",
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            {/* left */}
            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              <h2
                style={{
                  fontSize: isMobile
                    ? "clamp(2.25rem, 9.2vw, 3rem)"
                    : "clamp(1.6rem, 2.5vw, 2.6rem)",
                  fontWeight: 800,
                  letterSpacing: isMobile ? "-0.055em" : "-0.03em",
                  lineHeight: isMobile ? 1.02 : 1.15,
                  margin: "0 0 1.25rem",
                  maxWidth: "100%",
                  overflowWrap: "break-word",
                  wordBreak: "normal",
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
                  fontSize: isMobile ? 14.5 : 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.75,
                  margin: "0 0 1.6rem",
                  maxWidth: isMobile ? "100%" : 420,
                  overflowWrap: "break-word",
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
                  gap: isMobile ? 12 : 10,
                  marginBottom: "1.75rem",
                  width: "100%",
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
                      alignItems: "flex-start",
                      gap: 11,
                      width: "100%",
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
                        marginTop: 2,
                      }}
                    >
                      ✓
                    </div>

                    <span
                      style={{
                        fontSize: isMobile ? 14 : 13,
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                        overflowWrap: "break-word",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <button
                  style={{
                    padding: isMobile ? "14px 20px" : "12px 28px",
                    background: "var(--red)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "transform 0.2s, opacity 0.2s",
                    width: isMobile ? "100%" : "auto",
                    boxSizing: "border-box",
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
                    padding: isMobile ? "14px 20px" : "12px 28px",
                    background: "transparent",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 10,
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "border-color 0.2s, color 0.2s",
                    width: isMobile ? "100%" : "auto",
                    boxSizing: "border-box",
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
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  padding: isMobile ? "0.75rem 1rem" : "0.6rem 1rem",
                  borderBottom: "1px solid var(--bg-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxSizing: "border-box",
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
                      flexShrink: 0,
                    }}
                  />
                ))}

                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginLeft: 6,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  model_summary.json
                </span>
              </div>

              <div
                style={{
                  padding: isMobile ? "1.1rem 1rem 1.2rem" : "1.25rem 1.5rem",
                  fontSize: isMobile ? 11 : 12,
                  lineHeight: isMobile ? 1.85 : 1.9,
                  overflowX: "auto",
                  maxWidth: "100%",
                  boxSizing: "border-box",
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
                  <div
                    key={row.key}
                    style={{
                      display: "flex",
                      gap: 6,
                      minWidth: isMobile ? 260 : "max-content",
                      whiteSpace: "nowrap",
                    }}
                  >
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
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: isMobile ? "flex-start" : "space-between",
            padding: isMobile ? "1.2rem" : "1.25rem 2rem",
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: 14,
            flexWrap: "wrap",
            gap: isMobile ? "1rem" : "1rem",
            width: "100%",
            boxSizing: "border-box",
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
                flexShrink: 0,
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
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "0.5rem" : "2rem",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-muted)",
              width: isMobile ? "100%" : "auto",
              lineHeight: 1.5,
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
