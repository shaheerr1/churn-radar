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
        fontSize: 11,
        fontWeight: 500,
        color,
        padding: "2px 8px",
        background: color + "18",
        borderRadius: 4,
        border: `1px solid ${color}44`,
      }}
    >
      {label} {risk}%
    </span>
  );
}

export default function Hero() {
  const [visible, setVisible] = useState<number[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < CUSTOMERS.length) {
        setVisible((v) => [...v, i]);
        i++;
      } else {
        i = 0;
        setVisible([]);
        setTimeout(() => {}, 500);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = 1869;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= target) {
          clearInterval(timer);
          return target;
        }
        return c + step;
      });
    }, 24);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "8rem 2rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
          linear-gradient(rgba(255,59,59,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,59,59,0.03) 1px, transparent 1px)
        `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* red glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(255,59,59,0.08) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LEFT */}
        <div>
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
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--red)",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--red)",
              }}
            >
              Live churn detection
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
            }}
          >
            Stop watching
            <br />
            customers leave
            <br />
            <span style={{ color: "var(--red)" }}>in silence.</span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              maxWidth: 480,
              marginBottom: "2rem",
              lineHeight: 1.7,
            }}
          >
            ChurnRadar uses machine learning to identify which customers are
            about to cancel — weeks before they do — so you can act first.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              style={{
                padding: "14px 32px",
                background: "var(--red)",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                transition: "transform 0.2s, opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              See it live →
            </button>

            <button
              style={{
                padding: "14px 32px",
                background: "transparent",
                border: "1px solid var(--bg-border)",
                borderRadius: 10,
                color: "var(--text-secondary)",
                fontSize: 16,
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
              View dashboard
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--bg-border)",
            }}
          >
            {[
              {
                val: `${count.toLocaleString()}`,
                label: "Churners identified",
              },
              { val: "74%", label: "Recovery rate" },
              { val: "0.82", label: "Model AUC" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — live feed */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--bg-border)",
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
                color: "var(--text-secondary)",
              }}
            >
              live_customer_feed.stream
            </span>
          </div>

          <div style={{ padding: "0.5rem 0" }}>
            {/* header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 120px 80px",
                padding: "0.5rem 1.25rem",
                borderBottom: "1px solid var(--bg-border)",
              }}
            >
              {["Customer", "Tenure", "Contract", "Risk"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* rows */}
            {CUSTOMERS.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 120px 80px",
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid var(--bg-border)",
                  opacity: visible.includes(i) ? 1 : 0,
                  transform: visible.includes(i)
                    ? "translateY(0)"
                    : "translateY(-8px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                  background:
                    c.risk >= 70 ? "rgba(255,59,59,0.03)" : "transparent",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  >
                    {c.id}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    {c.charges}/mo
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    alignSelf: "center",
                  }}
                >
                  {c.tenure}mo
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    alignSelf: "center",
                  }}
                >
                  {c.contract}
                </span>
                <div style={{ alignSelf: "center" }}>
                  <RiskBadge risk={c.risk} />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "0.75rem 1.25rem",
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
                background: "var(--red)",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              Scoring customers in real time...
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}
