import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

function ProductDetail() {
  const { id } = useParams();
  // useParams reads the :id from the URL — so /products/5 gives us id = "5"

  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    const fetchProduct = api.get(`/products/${id}/`);
    const fetchCart = isLoggedIn ? api.get("/cart/") : Promise.resolve({ data: [] });

    Promise.all([fetchProduct, fetchCart])
      .then(([prodRes, cartRes]) => {
        setProduct(prodRes.data);
        setCartItems(cartRes.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const getCartItem = () => cartItems.find(item => item.product.id === parseInt(id));

  const refreshCart = async () => {
    if (isLoggedIn) {
      const res = await api.get("/cart/");
      setCartItems(res.data);
    }
  };

  const handleAdd = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    await api.post("/cart/add/", { product_id: product.id, quantity: 1 });
    await refreshCart();
    setMessage("Added to cart!");
    setTimeout(() => setMessage(""), 2000); // clear message after 2 seconds
  };

  const handleIncrease = async () => {
    await api.post("/cart/add/", { product_id: product.id, quantity: 1 });
    refreshCart();
  };

  const handleDecrease = async (cartItem) => {
    if (cartItem.quantity <= 1) {
      await api.delete(`/cart/remove/${cartItem.id}/`);
    } else {
      await api.post("/cart/update/", { item_id: cartItem.id, quantity: cartItem.quantity - 1 });
    }
    refreshCart();
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!product) return <p style={{ padding: "2rem" }}>Product not found.</p>;

  const cartItem = getCartItem();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>

      {/* Back link */}
      <Link to="/products" style={{ color: "#2563eb", fontSize: "14px", textDecoration: "none" }}>
        ← Back to Products
      </Link>

      <div style={{ display: "flex", gap: "2.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>

        {/* Left: image */}
        {product.image_url ? (
          <img
            src={product.image_display || product.image_url}
            alt={product.name}
            style={{ width: "340px", height: "340px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e5e7eb" }}
          />
        ) : (
          <div style={{ width: "340px", height: "340px", background: "#f3f4f6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            No image
          </div>
        )}

        {/* Right: details */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          {product.category_name && (
            <span style={categoryTagStyle}>{product.category_name}</span>
          )}
          <h1 style={{ fontSize: "1.6rem", margin: "0.5rem 0" }}>{product.name}</h1>
          <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111", margin: "0.5rem 0 1rem" }}>
            ₹{product.price}
          </p>
          <p style={{ color: "#6b7280", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            {product.description}
          </p>

          {/* Stock status */}
          <p style={{ fontSize: "14px", marginBottom: "1rem", color: product.stock > 0 ? "#16a34a" : "#dc2626" }}>
            {product.stock > 0 ? `✓ In stock (${product.stock} left)` : "✗ Out of stock"}
          </p>

          {/* Cart controls */}
          {product.stock === 0 ? (
            <div style={outOfStockStyle}>Out of stock</div>
          ) : !cartItem ? (
            <button onClick={handleAdd} style={addBtnStyle}>Add to Cart</button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={qtyRowStyle}>
                <button onClick={() => handleDecrease(cartItem)} style={qtyBtnStyle}>−</button>
                <span style={qtyNumStyle}>{cartItem.quantity}</span>
                <button onClick={handleIncrease} style={qtyBtnStyle}>+</button>
              </div>
              <Link to="/cart" style={goToCartStyle}>Go to Cart →</Link>
            </div>
          )}

          {/* Temporary success message */}
          {message && (
            <p style={{ marginTop: "0.75rem", color: "#16a34a", fontSize: "14px" }}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const categoryTagStyle = { display: "inline-block", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "999px" };
const addBtnStyle = { padding: "12px 32px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer" };
const qtyRowStyle = { display: "inline-flex", alignItems: "center", background: "#eff6ff", border: "1.5px solid #2563eb", borderRadius: "8px", padding: "2px" };
const qtyBtnStyle = { width: "38px", height: "38px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "20px", cursor: "pointer" };
const qtyNumStyle = { fontWeight: "700", fontSize: "17px", color: "#1d4ed8", minWidth: "36px", textAlign: "center" };
const outOfStockStyle = { padding: "12px 24px", background: "#f3f4f6", color: "#9ca3af", borderRadius: "8px", fontSize: "15px", display: "inline-block" };
const goToCartStyle = { color: "#2563eb", fontWeight: "600", textDecoration: "none", fontSize: "14px" };

export default ProductDetail;