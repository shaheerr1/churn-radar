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
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${danger ? "#ff3b3b33" : "var(--bg-border)"}`,
        borderRadius: 16,
        padding: "2rem 2.5rem",
        position: "relative",
        overflow: "hidden",
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
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
          fontWeight: 700,
          color: danger ? "var(--red)" : "var(--text-primary)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: "0.75rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

export default function ProblemSection() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "8rem 4rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "var(--red-dim)",
              border: "1px solid #ff3b3b44",
              borderRadius: 999,
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--red)",
              }}
            >
              the problem
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
            Your customers are leaving.
            <br />
            <span style={{ color: "var(--red)" }}>You find out too late.</span>
          </h2>

          <p
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            By the time a customer cancels, they made that decision weeks ago.
            Every day without visibility is revenue permanently lost.
          </p>
        </div>

        {/* stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: "2.5rem",
          }}
        >
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

        {/* the insight */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: 16,
            padding: "3rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: "1rem",
              }}
            >
              The signals are there.
              <br />
              <span style={{ color: "var(--cyan)" }}>
                You're just not reading them.
              </span>
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                fontSize: 15,
              }}
            >
              Before a customer cancels they stop logging in as often, raise
              more support tickets, fail payments, and remove team members.
              These patterns are predictable. They just need a model to catch
              them.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { signal: "Login frequency drops below threshold", weight: 92 },
              { signal: "Support tickets spike in 30 days", weight: 78 },
              { signal: "Month-to-month + high charges combo", weight: 97 },
              { signal: "New customer in first 90 days", weight: 85 },
              { signal: "No add-on services active", weight: 63 },
            ].map((s) => (
              <div
                key={s.signal}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    {s.signal}
                  </div>
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
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    minWidth: 32,
                  }}
                >
                  {s.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
