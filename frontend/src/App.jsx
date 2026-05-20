import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "./api";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import AdminRoute from "./components/AdminRoute";
import MyOrders from "./pages/MyOrders";
import About from "./pages/About";
import "./theme.css";

function Navbar({ isLoggedIn, onLogoutNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={navStyle}>
      <Link to="/" style={logoStyle}>
        <span style={{ color: "#e94560" }}>Shop</span>Vi
      </Link>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link to="/products" style={linkStyle}>Products</Link>
        <Link to="/about" style={linkStyle}>About</Link>
        {isLoggedIn ? (
          <>
            <Link to="/my-orders" style={linkStyle}>My Orders</Link>
            <Link to="/cart" style={cartLinkStyle}>
              <span style={{ fontSize: 18 }}>🛒</span> Cart
            </Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
            <button onClick={onLogoutNavigate} style={logoutBtnStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={registerBtnStyle}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function NavbarWithNavigate({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const handleLogoutNavigate = async () => {
    await onLogout();
    navigate('/login', { state: { message: 'You have been logged out.' } });
  };
  return <Navbar isLoggedIn={isLoggedIn} onLogoutNavigate={handleLogoutNavigate} />;
}




function Home({ isLoggedIn }) {
  
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const saveBudget = () => {
    if (!budgetInput || parseFloat(budgetInput) <= 0) return;
    localStorage.setItem("shopvi_budget", budgetInput);
    setShowBudgetSetup(false);
    alert(`✅ Budget set to ₹${budgetInput}! Happy shopping.`);
  };
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Hero ── */}
      <div style={heroStyle}>
        <div style={heroBgPattern} />
        <div style={heroContent}>
          <div style={{ display: "inline-block", background: "rgba(233,69,96,0.12)", color: "#e94560", padding: "6px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: "1.25rem", letterSpacing: "0.05em" }}>
            ✦ India's Premium Shopping Destination
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.15, marginBottom: "1.25rem" }}>
            Shop Smart,<br />
            <span style={{ color: "#e94560" }}>Live Better</span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: 17, lineHeight: 1.7, maxWidth: 480, marginBottom: "2rem" }}>
            Discover curated products across fashion, electronics, books and more — all in one beautiful store.
          </p>
          
          {isLoggedIn ? (
        <>
          {/* Budget setup modal */}
          {showBudgetSetup && (
            <div style={budgetBackdrop}>
              <div style={budgetModal}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#1a1a2e", marginBottom:"0.5rem" }}>
                  💡 Set Your Shopping Budget
                </h3>
                <p style={{ color:"#6b7280", fontSize:14, marginBottom:"1.25rem" }}>
                  We'll warn you in your cart if you exceed this limit.
                </p>
                <input
                  type="number"
                  placeholder="Enter budget (e.g. ₹2000)"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #e8e4df", borderRadius:10, fontSize:15, marginBottom:"1rem", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif" }}
                />
                <div style={{ display:"flex", gap:"0.75rem" }}>
                  <button onClick={saveBudget} style={{ flex:1, padding:"12px", background:"#e94560", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                    Save Budget
                  </button>
                  <button onClick={() => setShowBudgetSetup(false)} style={{ flex:1, padding:"12px", background:"#f3f4f6", color:"#374151", border:"none", borderRadius:10, fontSize:15, cursor:"pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", alignItems:"center" }}>
          <Link to="/products" style={heroPrimaryBtn}>Browse Products</Link>
          <Link to="/cart" style={heroSecondaryBtn}>View Cart</Link>
          <Link to="/my-orders" style={heroSecondaryBtn}>My Orders</Link>
          <Link to="/profile" style={heroSecondaryBtn}>Profile</Link>
          <button
            onClick={() => setShowBudgetSetup(true)}
            style={{ ...heroSecondaryBtn, border:"1.5px solid #fde68a", background:"#fffbeb", color:"#92400e", cursor:"pointer" }}
          >
            💡 Set Budget
          </button>
        </div>
      </>
        ) : (
          <div style={{ display:"flex", gap:"1rem" }}>
            <Link to="/register" style={heroPrimaryBtn}>Get Started — Free</Link>
            <Link to="/login" style={heroSecondaryBtn}>Sign In</Link>
          </div>
        )}
        </div>
        <div style={heroImageCol}>
          <div style={heroImageBox}>
            <div style={heroImageInner}>
              <span style={{ fontSize: 80 }}>🛍️</span>
              <p style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: 18, marginTop: 16, opacity: 0.9 }}>Premium Shopping</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={statsStrip}>
        {[
          { num: "500+", label: "Products" },
          { num: "10K+", label: "Happy Customers" },
          { num: "4.9★", label: "Average Rating" },
          { num: "Free", label: "Easy Returns" },
        ].map(s => (
          <div key={s.label} style={statItem}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>{s.num}</span>
            <span style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Category highlights ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={accentBar} />
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: "#1a1a2e", marginBottom: "0.4rem" }}>Shop by Category</h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: 14 }}>Something for everyone</p>
        <div style={catGrid}>
          {[
            { icon: "👗", name: "Fashion", color: "#fef0f3" },
            { icon: "📱", name: "Electronics", color: "#eff6ff" },
            { icon: "📚", name: "Books", color: "#f0fdf4" },
            { icon: "🏠", name: "Home", color: "#fffbeb" },
          ].map(c => (
            <Link to="/products" key={c.name} style={{ ...catCard, background: c.color }}>
              <span style={{ fontSize: 36 }}>{c.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 15, color: "#1a1a2e", marginTop: 10 }}>{c.name}</span>
              <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Browse →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={footerStyle}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>
              <span style={{ color: "#e94560" }}>Shop</span>Vi
            </span>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 6 }}>© 2025 ShopVi. Made in Chennai 🇮🇳</p>
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link to="/about" style={{ color: "#9ca3af", fontSize: 14 }}>About</Link>
            <Link to="/products" style={{ color: "#9ca3af", fontSize: 14 }}>Products</Link>
            <Link to="/register" style={{ color: "#9ca3af", fontSize: 14 }}>Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));

  const handleLogout = async () => {
    try { await api.delete('/cart/clear/'); } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_staff');
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <NavbarWithNavigate isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

/* ── Styles ── */
const navStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "1rem 2rem", background: "#fff",
  borderBottom: "1px solid #e8e4df", position: "sticky", top: 0, zIndex: 100,
  fontFamily: "'DM Sans', sans-serif",
};
const logoStyle = {
  fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem",
  color: "#1a1a2e", textDecoration: "none", letterSpacing: "-0.01em"
};
const linkStyle = { color: "#374151", textDecoration: "none", fontSize: 15, fontWeight: 500, transition: "color 0.15s" };
const cartLinkStyle = { display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "#1a1a2e", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" };
const logoutBtnStyle = { background: "none", border: "1.5px solid #e8e4df", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#374151", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 };
const registerBtnStyle = { padding: "8px 20px", background: "#e94560", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" };

const heroStyle = {
  display: "flex", alignItems: "center", gap: "2rem",
  maxWidth: 1100, margin: "0 auto", padding: "4rem 2rem 3rem",
  position: "relative", flexWrap: "wrap",
};
const heroBgPattern = {
  position: "absolute", inset: 0, zIndex: -1,
  background: "radial-gradient(ellipse at 80% 50%, #fff5f6 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #f0f4ff 0%, transparent 50%)",
  pointerEvents: "none",
};
const heroContent = { flex: "1 1 420px" };
const heroImageCol = { flex: "0 0 280px", display: "flex", justifyContent: "center" };
const heroImageBox = {
  width: 260, height: 260, borderRadius: "50% 30% 50% 30%",
  background: "linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const heroImageInner = { textAlign: "center" };
const heroPrimaryBtn = {
  padding: "13px 28px", background: "#e94560", color: "#fff",
  borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600,
  transition: "background 0.2s",
};
const heroSecondaryBtn = {
  padding: "13px 24px", background: "#fff", color: "#1a1a2e",
  border: "1.5px solid #e8e4df", borderRadius: 10,
  textDecoration: "none", fontSize: 15, fontWeight: 500,
};
const statsStrip = {
  background: "#1a1a2e", padding: "1.5rem 2rem",
  display: "flex", justifyContent: "center", gap: "4rem", flexWrap: "wrap",
};
const statItem = { display: "flex", flexDirection: "column", alignItems: "center", color: "#fff" };
const catGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" };
const catCard = {
  display: "flex", flexDirection: "column", alignItems: "center", padding: "1.75rem 1rem",
  borderRadius: 14, border: "1px solid #e8e4df", textDecoration: "none",
  transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",
};
const accentBar = { width: 48, height: 3, background: "#e94560", borderRadius: 99, marginBottom: "1rem" };
const footerStyle = { background: "#1a1a2e", marginTop: "2rem" };
const budgetBackdrop = { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 };
const budgetModal = { background:"#fff", borderRadius:16, padding:"2rem", width:"100%", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" };
export default App;
