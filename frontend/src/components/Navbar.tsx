import { useState, useEffect } from "react";

const NAV_STYLES = `
  .nav-links a { text-decoration: none }

  /* ── Mobile menu ── */
  .nav-mobile-menu {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 99;
    background: rgba(10,10,15,0.98);
    backdrop-filter: blur(16px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    animation: menuFadeIn .2s ease both;
  }
  @keyframes menuFadeIn {
    from { opacity: 0; transform: translateY(-8px) }
    to   { opacity: 1; transform: translateY(0) }
  }
  .nav-mobile-menu a {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-decoration: none;
    letter-spacing: -0.02em;
    transition: color .2s;
  }
  .nav-mobile-menu a:hover { color: var(--text-primary) }

  /* ── Hamburger icon ── */
  .nav-burger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 4px;
  }
  .nav-burger span {
    display: block;
    width: 22px;
    height: 2px;
    border-radius: 2px;
    background: var(--text-secondary);
    transition: all .25s ease;
  }
  /* X state */
  .nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg) }
  .nav-burger.open span:nth-child(2) { opacity: 0 }
  .nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg) }

  /* ── Hide links on mobile, show burger ── */
  @media (max-width: 640px) {
    .nav-links   { display: none !important }
    .nav-cta-desktop { display: none !important }
    .nav-burger  { display: flex }
  }
`;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <style>{NAV_STYLES}</style>

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
          background:
            scrolled || menuOpen ? "rgba(10,10,15,0.95)" : "transparent",
          borderBottom:
            scrolled || menuOpen
              ? "1px solid #1e1e2e"
              : "1px solid transparent",
          backdropFilter: scrolled || menuOpen ? "blur(12px)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 101,
          }}
        >
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

        {/* Desktop nav links */}
        <div
          className="nav-links"
          style={{ display: "flex", alignItems: "center", gap: "2rem" }}
        >
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
        </div>

        {/* Desktop CTA */}
        <button
          className="nav-cta-desktop"
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

        {/* Hamburger (mobile only) */}
        <button
          className={`nav-burger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          style={{ zIndex: 101 }}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          {["How it works", "Results", "Pricing"].map((item) => (
            <a key={item} href="#" onClick={close}>
              {item}
            </a>
          ))}
          <button
            onClick={() =>
              (window.location.href =
                "mailto:shaheer.aslam@icloud.com?subject=ChurnRadar%20Access%20Request&body=Hi%20Shaheer%2C%20I%27d%20like%20to%20request%20access%20to%20ChurnRadar.")
            }
            style={{
              marginTop: "0.5rem",
              padding: "12px 36px",
              background: "var(--red)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              transition: "opacity .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Book a demo
          </button>
        </div>
      )}
    </>
  );
}
