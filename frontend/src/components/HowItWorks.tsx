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

export default function HowItWorks() {
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
      {/* cyan glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "-5%",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)",
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
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "var(--cyan-dim)",
              border: "1px solid #00d4ff33",
              borderRadius: 999,
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--cyan)",
              }}
            >
              how it works
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
            From raw data to
            <br />
            <span style={{ color: "var(--cyan)" }}>
              saved revenue in 4 steps.
            </span>
          </h2>

          <p
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            No data science team. No months of setup. Connect your data and your
            first predictions are ready in minutes.
          </p>
        </div>

        {/* steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: "4rem",
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--bg-border)",
                borderRadius: 16,
                padding: "2rem 2.5rem",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.3s, transform 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = step.color + "55";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--bg-border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* top accent line */}
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

              {/* step number */}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 48,
                  fontWeight: 700,
                  color: step.color,
                  opacity: 0.15,
                  lineHeight: 1,
                  marginBottom: "1rem",
                  letterSpacing: "-0.04em",
                }}
              >
                {step.number}
              </div>

              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                  color: "var(--text-primary)",
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                {step.description}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "10px 14px",
                  background: step.color + "0f",
                  border: `1px solid ${step.color}22`,
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: step.color,
                    lineHeight: 1.5,
                  }}
                >
                  {step.detail}
                </span>
              </div>

              {/* connector arrow — not on last */}
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    right: -12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 24,
                    height: 24,
                    background: "var(--bg)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    zIndex: 2,
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: 16,
            padding: "2rem 3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 4,
              }}
            >
              Ready to see it with your data?
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
              }}
            >
              Takes less than 10 minutes to get your first predictions.
            </div>
          </div>
          <button
            style={{
              padding: "12px 28px",
              background: "var(--cyan)",
              border: "none",
              borderRadius: 10,
              color: "#0a0a0f",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              transition: "opacity 0.2s, transform 0.2s",
            }}
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
  );
}
