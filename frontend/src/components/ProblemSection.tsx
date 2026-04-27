function StatCard({
  value,
  label,
  sub,
  danger = false,
}: {
  value: string;
  label: string;
  sub: string;
  danger?: boolean;
}) {
  return (
    <div
      className="ps-stat-card"
      style={{
        border: `1px solid ${danger ? "#ff3b3b33" : "var(--bg-border)"}`,
      }}
    >
      {danger && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "var(--red)",
          }}
        />
      )}
      <div
        className="ps-stat-value"
        style={{ color: danger ? "var(--red)" : "var(--text-primary)" }}
      >
        {value}
      </div>
      <div className="ps-stat-label">{label}</div>
      <div className="ps-stat-sub">{sub}</div>
    </div>
  );
}

const styles = `
  .ps-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(1.5rem, 3vw, 4rem) clamp(1rem, 5vw, 4rem);
    position: relative;
  }

  .ps-header {
    text-align: center;
    margin-bottom: clamp(1.25rem, 2.5vw, 2.5rem);
  }

  .ps-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: clamp(3px, 0.6vw, 6px) clamp(8px, 1.2vw, 14px);
    background: var(--red-dim);
    border: 1px solid #ff3b3b44;
    border-radius: 999px;
    margin-bottom: clamp(0.5rem, 1vw, 1rem);
  }

  .ps-badge span {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1.1vw, 12px);
    color: var(--red);
  }

  .ps-title {
    font-size: clamp(1.4rem, 3.2vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: clamp(0.5rem, 1vw, 1rem);
  }

  .ps-subtitle {
    font-size: clamp(13px, 1.3vw, 16px);
    color: var(--text-secondary);
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* Stat cards */
  .ps-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(6px, 1vw, 14px);
    margin-bottom: clamp(0.75rem, 1.5vw, 1.5rem);
  }

  .ps-stat-card {
    background: var(--bg-card);
    border-radius: clamp(10px, 1.2vw, 14px);
    padding: clamp(0.75rem, 1.5vw, 1.5rem) clamp(0.75rem, 1.5vw, 1.75rem);
    position: relative;
    overflow: hidden;
  }

  .ps-stat-value {
    font-family: var(--font-mono);
    font-size: clamp(1.1rem, 2vw, 1.9rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: clamp(0.3rem, 0.6vw, 0.6rem);
  }

  .ps-stat-label {
    font-size: clamp(11px, 1.1vw, 14px);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: clamp(2px, 0.4vw, 5px);
  }

  .ps-stat-sub {
    font-size: clamp(10px, 1vw, 12px);
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* Insight box */
  .ps-insight {
    background: var(--bg-card);
    border: 1px solid var(--bg-border);
    border-radius: clamp(10px, 1.2vw, 14px);
    padding: clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(1.25rem, 2.5vw, 2.5rem);
    align-items: center;
  }

  .ps-insight h3 {
    font-size: clamp(1.1rem, 1.8vw, 1.6rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: clamp(0.4rem, 0.8vw, 0.75rem);
    line-height: 1.2;
  }

  .ps-insight p {
    color: var(--text-secondary);
    line-height: 1.7;
    font-size: clamp(12px, 1.1vw, 14px);
  }

  .ps-signals {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1vw, 12px);
  }

  .ps-signal-label {
    font-size: clamp(10px, 1vw, 12px);
    color: var(--text-secondary);
    margin-bottom: clamp(3px, 0.5vw, 5px);
  }

  .ps-signal-pct {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1vw, 12px);
    color: var(--text-muted);
    min-width: 30px;
  }

  /* Tablet: 2x2 stat grid */
  @media (max-width: 900px) {
    .ps-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Mobile */
  @media (max-width: 600px) {
    .ps-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .ps-insight {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .ps-title br { display: none; }
  }

  @media (max-width: 400px) {
    .ps-stats-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default function ProblemSection() {
  return (
    <>
      <style>{styles}</style>
      <section className="ps-section">
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div className="ps-header">
            <div className="ps-badge">
              <span>the problem</span>
            </div>
            <h2 className="ps-title">
              Your customers are leaving. <br />
              <span style={{ color: "var(--red)" }}>
                You find out too late.
              </span>
            </h2>
            <p className="ps-subtitle">
              By the time a customer cancels, they made that decision weeks ago.
              Every day without visibility is revenue permanently lost.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="ps-stats-grid">
            <StatCard
              value="£1,453,294"
              label="Annual revenue lost to churn"
              sub="Based on 1,869 churned customers at £64.80 average monthly charge"
              danger
            />
            <StatCard
              value="26.6%"
              label="Of all customers churn every year"
              sub="Nearly 1 in 4 customers will leave — most without any warning signal"
              danger
            />
            <StatCard
              value="42.7%"
              label="Month-to-month churn rate"
              sub="Customers on flexible contracts churn at 15x the rate of annual customers"
              danger
            />
            <StatCard
              value="3 weeks"
              label="Average lead time before cancel"
              sub="Customers show behavioural signals weeks before they actually leave"
            />
          </div>

          {/* Insight */}
          <div className="ps-insight">
            <div>
              <h3>
                The signals are there. <br />
                <span style={{ color: "var(--cyan)" }}>
                  You're just not reading them.
                </span>
              </h3>
              <p>
                Before a customer cancels they stop logging in as often, raise
                more support tickets, fail payments, and remove team members.
                These patterns are predictable. They just need a model to catch
                them.
              </p>
            </div>

            <div className="ps-signals">
              {[
                { signal: "Login frequency drops below threshold", weight: 92 },
                { signal: "Support tickets spike in 30 days", weight: 78 },
                { signal: "Month-to-month + high charges combo", weight: 97 },
                { signal: "New customer in first 90 days", weight: 85 },
                { signal: "No add-on services active", weight: 63 },
              ].map((s) => (
                <div
                  key={s.signal}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="ps-signal-label">{s.signal}</div>
                    <div
                      style={{
                        height: 4,
                        background: "#1e1e2e",
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          height: 4,
                          borderRadius: 4,
                          width: `${s.weight}%`,
                          background:
                            s.weight > 85
                              ? "var(--red)"
                              : s.weight > 70
                                ? "#ff9500"
                                : "var(--cyan)",
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>
                  <span className="ps-signal-pct">{s.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
