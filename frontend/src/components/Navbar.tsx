import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(10,10,15,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid #1e1e2e" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--red)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          C
        </div>
        <span
          style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}
        >
          Churn<span style={{ color: "var(--red)" }}>Radar</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {["How it works", "Results", "Pricing"].map((item) => (
          <a
            key={item}
            href="#"
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            {item}
          </a>
        ))}
        <button
          style={{
            padding: "8px 20px",
            background: "var(--red)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Book a demo
        </button>
      </div>
    </nav>
  );
}
