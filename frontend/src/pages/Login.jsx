import { useState } from "react";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const logoutMessage = location.state?.message;
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/token/", {
        username: form.username,   // ← was just "username" (undefined variable)
        password: form.password,   // ← was just "password" (undefined variable)
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      const profileRes = await api.get("/profile/", {
        headers: {
        Authorization: `Bearer ${res.data.access}`
        }
      });
      localStorage.setItem("user", JSON.stringify(profileRes.data));
      onLogin();      // tells App.jsx to update isLoggedIn state
      navigate("/");  // redirect to home
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>Login</h2>
      {logoutMessage && (
      <div style={{
        background: "#f0fdf4",
        border: "1px solid #86efac",
        color: "#166534",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "1rem",
        fontSize: "14px"
      }}>
        ✅ {logoutMessage}
      </div>
    )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} style={inp} /><br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} style={inp} /><br />
        <button type="submit" style={btn}>Login</button>
      </form>
      <p>No account? <a href="/register">Register</a></p>
    </div>
  );
}

const inp = { display: "block", width: "100%", padding: "10px", marginBottom: "12px", fontSize: "15px" };
const btn = { padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px" };

export default Login;