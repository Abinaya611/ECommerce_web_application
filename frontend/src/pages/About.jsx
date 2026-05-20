import { Link } from "react-router-dom";

export default function About() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8f7f4", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div style={heroSection}>
        <div style={heroBg} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto", textAlign: "center", padding: "5rem 2rem 4rem" }}>
          <div style={pill}>Our Story</div>
          <h1 style={heroTitle}>
            Built for India,<br />
            <span style={{ color: "#e94560" }}>Loved by All</span>
          </h1>
          <p style={heroSub}>
            ShopVi was born with one simple goal — make premium shopping accessible to everyone, from Chennai to Kashmir.
          </p>
        </div>
      </div>

      {/* ── Mission ── */}
      <div style={section}>
        <div style={twoCol}>
          <div style={missionBox}>
            <div style={accentBar} />
            <h2 style={sectionTitle}>Our Mission</h2>
            <p style={bodyText}>
              We believe great products should be easy to find and even easier to buy.
              ShopVi curates quality products across fashion, electronics, books, and home essentials —
              bringing the best of India's marketplace to your fingertips.
            </p>
            <p style={{ ...bodyText, marginTop: "1rem" }}>
              Every product on our platform is handpicked for quality, value, and reliability.
              We work directly with suppliers to cut out the middlemen and pass the savings on to you.
            </p>
          </div>
          <div style={valuesCol}>
            {[
              { icon: "🎯", title: "Curated Quality", desc: "Every product is handpicked." },
              { icon: "🔒", title: "Secure Shopping", desc: "End-to-end protected checkout." },
              { icon: "🚚", title: "Fast Delivery", desc: "Pan-India delivery network." },
              { icon: "💬", title: "24/7 Support", desc: "Always here when you need us." },
            ].map(v => (
              <div key={v.title} style={valueCard}>
                <span style={{ fontSize: 28 }}>{v.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, color: "#1a1a2e", margin: "0 0 3px" }}>{v.title}</p>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={statsSection}>
        {[
          { num: "500+", label: "Products Listed" },
          { num: "10,000+", label: "Happy Customers" },
          { num: "50+", label: "Brand Partners" },
          { num: "4.9 / 5", label: "Customer Rating" },
        ].map(s => (
          <div key={s.label} style={statBox}>
            <span style={statNum}>{s.num}</span>
            <span style={statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Team ── */}
      <div style={section}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={accentBar} />
          <h2 style={sectionTitle}>The Team</h2>
          <p style={{ ...bodyText, marginBottom: "2rem" }}>Small but passionate — we're building the future of Indian e-commerce.</p>
          <div style={teamGrid}>
            {[
              { name: "Arun Kumar", role: "Founder & CEO", emoji: "👨‍💼", loc: "Chennai" },
              { name: "Priya Sharma", role: "Head of Products", emoji: "👩‍💻", loc: "Bangalore" },
              { name: "Vikram Nair", role: "Tech Lead", emoji: "👨‍🔬", loc: "Hyderabad" },
            ].map(t => (
              <div key={t.name} style={teamCard}>
                <div style={avatar}>{t.emoji}</div>
                <p style={{ fontWeight: 600, fontSize: 16, color: "#1a1a2e", margin: "0 0 4px" }}>{t.name}</p>
                <p style={{ fontSize: 13, color: "#e94560", fontWeight: 600, margin: "0 0 4px" }}>{t.role}</p>
                <p style={{ fontSize: 12, color: "#9ca3af" }}>📍 {t.loc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contact ── */}
      <div style={contactSection}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ ...accentBar, background: "#fff" }} />
          <h2 style={{ ...sectionTitle, color: "#fff" }}>Get in Touch</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2.5rem", fontSize: 15 }}>We'd love to hear from you</p>
          <div style={contactGrid}>
            {[
              { icon: "📧", label: "Email", value: "hello@shopvi.in" },
              { icon: "📞", label: "Phone", value: "+91 98765 43210" },
              { icon: "📍", label: "Address", value: "Anna Nagar, Chennai — 600 040" },
              { icon: "🕐", label: "Hours", value: "Mon–Sat, 9 AM – 6 PM IST" },
            ].map(c => (
              <div key={c.label} style={contactCard}>
                <span style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</span>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>{c.label}</p>
                <p style={{ fontSize: 15, color: "#fff", fontWeight: 500, margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#f8f7f4" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#1a1a2e", marginBottom: "0.75rem" }}>
          Ready to Start Shopping?
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: 15 }}>Join thousands of happy ShopVi customers.</p>
        <Link to="/products" style={ctaBtn}>Browse Products →</Link>
      </div>

      {/* ── Footer ── */}
      <footer style={footerStyle}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>
            <span style={{ color: "#e94560" }}>Shop</span>Vi
          </span>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>© 2025 ShopVi. Made with ❤️ in Chennai</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link to="/products" style={{ color: "#9ca3af", fontSize: 13 }}>Products</Link>
            <Link to="/register" style={{ color: "#9ca3af", fontSize: 13 }}>Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Styles ── */
const heroSection = { position: "relative", background: "#fff", overflow: "hidden" };
const heroBg = { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, #fff0f2 0%, transparent 65%)", pointerEvents: "none" };
const pill = { display: "inline-block", background: "rgba(233,69,96,0.1)", color: "#e94560", padding: "6px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: "1rem", letterSpacing: "0.04em" };
const heroTitle = { fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.2, marginBottom: "1.25rem" };
const heroSub = { color: "#6b7280", fontSize: 17, lineHeight: 1.7 };
const section = { padding: "3.5rem 2rem", maxWidth: 1100, margin: "0 auto" };
const accentBar = { width: 48, height: 3, background: "#e94560", borderRadius: 99, marginBottom: "1rem" };
const sectionTitle = { fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#1a1a2e", marginBottom: "0.75rem" };
const bodyText = { color: "#6b7280", lineHeight: 1.8, fontSize: 15 };
const twoCol = { display: "flex", gap: "3rem", flexWrap: "wrap" };
const missionBox = { flex: "1 1 320px" };
const valuesCol = { flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "1rem" };
const valueCard = { display: "flex", gap: "1rem", alignItems: "flex-start", background: "#fff", border: "1px solid #e8e4df", borderRadius: 12, padding: "1rem 1.25rem" };
const statsSection = { background: "#1a1a2e", padding: "2.5rem 2rem", display: "flex", justifyContent: "center", gap: "4rem", flexWrap: "wrap" };
const statBox = { display: "flex", flexDirection: "column", alignItems: "center" };
const statNum = { fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: "#fff" };
const statLabel = { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 };
const teamGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" };
const teamCard = { background: "#fff", border: "1px solid #e8e4df", borderRadius: 14, padding: "2rem 1.5rem", textAlign: "center", boxShadow: "0 2px 12px rgba(26,26,46,0.06)" };
const avatar = { width: 64, height: 64, borderRadius: "50%", background: "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 1rem" };
const contactSection = { background: "#1a1a2e", padding: "3.5rem 2rem" };
const contactGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" };
const contactCard = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "flex-start" };
const ctaBtn = { padding: "14px 36px", background: "#e94560", color: "#fff", borderRadius: 10, fontSize: 16, fontWeight: 600, textDecoration: "none" };
const footerStyle = { background: "#111827" };
