import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const statusSteps = ["pending", "shipped", "delivered"];

function StatusTracker({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "1rem 0 0.5rem" }}>
      {statusSteps.map((step, i) => {
        const done = statusSteps.indexOf(current) >= i;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 13, fontWeight: 700,
              background: done ? "#2563eb" : "#e5e7eb",
              color: done ? "#fff" : "#9ca3af",
              flexShrink: 0
            }}>
              {done ? "✓" : i + 1}
            </div>
            <span style={{ marginLeft: 6, fontSize: 12, color: done ? "#2563eb" : "#9ca3af", fontWeight: done ? 600 : 400, flexShrink: 0 }}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </span>
            {i < 2 && <div style={{ flex: 1, height: 2, background: done && statusSteps.indexOf(current) > i ? "#2563eb" : "#e5e7eb", margin: "0 8px" }} />}
          </div>
        );
      })}
    </div>
  );
}

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    api.get("/my-orders/").then(res => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (!isLoggedIn) return <p style={{ padding: "2rem" }}>Please <Link to="/login">login</Link> to view orders.</p>;
  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "750px", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>My Orders</h2>

      {orders.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No orders yet. <Link to="/products">Start shopping!</Link></p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={cardStyle}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Order #{order.id}</span>
              <span style={badgeStyle(order.status)}>{order.status.toUpperCase()}</span>
            </div>

            {/* Status tracker */}
            <StatusTracker current={order.status} />

            {/* Items */}
            <div style={{ marginTop: "1rem", borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
              {order.items.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#374151", marginBottom: 4 }}>
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>₹{item.price_at_purchase}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(order.created_at).toLocaleString()}</span>
              <span style={{ fontWeight: 700 }}>Total: ₹{Number(order.total_price).toFixed(2)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = { border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", marginBottom: "1.25rem", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };
const badgeStyle = (s) => ({
  padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
  background: s === "delivered" ? "#dcfce7" : s === "shipped" ? "#dbeafe" : "#fef9c3",
  color: s === "delivered" ? "#166534" : s === "shipped" ? "#1e40af" : "#854d0e"
});

export default MyOrders;