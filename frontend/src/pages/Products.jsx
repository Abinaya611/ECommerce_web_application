// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../api";
// import Pagination from "../components/Pagination";

// function Products() {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalCount, setTotalCount] = useState(0);

//   // filter state — these drive what gets fetched
//   const [search, setSearch] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [minPrice, setMinPrice] = useState("");
//   const [maxPrice, setMaxPrice] = useState("");

  

//   const isLoggedIn = !!localStorage.getItem("access_token");

//   // fetch categories once on mount (they don't change with filters)
//   useEffect(() => {
//     api.get("/categories/")
//     .then(res => setCategories(res.data))
//     .catch(() => setCategories([]));
//   }, []);

//   // fetch cart once on mount
//   useEffect(() => {
//     if (isLoggedIn) {
//       api.get("/cart/")
//       .then(res => setCartItems(res.data))
//       .catch(() => setCartItems([]));
//     }
//   }, []);

//   // fetch products whenever any filter changes
//     // fetch products whenever any filter or page changes
// useEffect(() => {
//   setLoading(true);

//   const params = { page };
//   if (search) params.search = search;
//   if (selectedCategory) params.category = selectedCategory;
//   if (minPrice) params.min_price = minPrice;
//   if (maxPrice) params.max_price = maxPrice;

//   api.get("/products/", { params })
//     .then(res => {
//       setProducts(res.data.results || []);
//       setTotalCount(res.data.count || 0);
//     })
//     .catch(() => setProducts([]))
//     .finally(() => setLoading(false));

// }, [search, selectedCategory, minPrice, maxPrice, page]);
//   // ↑ this array means: re-run this effect whenever any of these values change

//   const getCartItem = (productId) => cartItems.find(item => item.product.id === productId);

//   const refreshCart = async () => {
//     if (isLoggedIn) {
//       const res = await api.get("/cart/");
//       setCartItems(res.data);
//     }
//   };

//   const handleAdd = async (productId) => {
//     if (!isLoggedIn) { window.location.href = "/login"; return; }
//     await api.post("/cart/add/", { product_id: productId, quantity: 1 });
//     refreshCart();
//   };

//   const handleIncrease = async (productId) => {
//     await api.post("/cart/add/", { product_id: productId, quantity: 1 });
//     refreshCart();
//   };

//   const handleDecrease = async (cartItem) => {
//     if (cartItem.quantity <= 1) {
//       await api.delete(`/cart/remove/${cartItem.id}/`);
//     } else {
//       await api.post("/cart/update/", { item_id: cartItem.id, quantity: cartItem.quantity - 1 });
//     }
//     refreshCart();
//   };

//   const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

//   return (
//     <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>

//       {/* ── Top bar: title + cart link ── */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
//         <h2 style={{ margin: 0 }}>Products</h2>
//         {isLoggedIn && (
//           <Link to="/cart" style={viewCartStyle}>
//             Cart {cartCount > 0 && <span style={badgeStyle}>{cartCount}</span>}
//           </Link>
//         )}
//       </div>


//       {/* ── Filter bar ── */}
//       <div style={filterBarStyle}>

//         {/* Search input */}
//         <input
//           type="text"
//           placeholder="Search products..."
//           value={search}
//           onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//           style={inputStyle}
//         />

//         {/* Category dropdown */}
//         <select
//           value={selectedCategory}
//           onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
//           style={inputStyle}
//         >
//           <option value="">All Categories</option>
//           {categories.map(cat => (
//             <option key={cat.id} value={cat.id}>{cat.name}</option>
//           ))}
//         </select>

//         {/* Price range */}
//         <input
//           type="number"
//           placeholder="Min price"
//           value={minPrice}
//           onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
//           style={{ ...inputStyle, width: "110px" }}
//         />
//         <input
//           type="number"
//           placeholder="Max price"
//           value={maxPrice}
//           onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
//           style={{ ...inputStyle, width: "110px" }}
//         />

//         {/* Clear filters button */}
//         {(search || selectedCategory || minPrice || maxPrice) && (
//           <button onClick={() => {
//             setSearch(""); setSelectedCategory(""); setMinPrice(""); setMaxPrice("");
//             setPage(1);
//           }} style={clearBtnStyle}>
//             Clear filters
//           </button>
//         )}
//       </div>

//       {/* ── Results count ── */}
//       {!loading && (
//         <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "1rem" }}>
//           {totalCount} product{totalCount !== 1 ? 's' : ''} found
//         </p>
//       )}

//       {/* ── Product grid ── */}
//       {loading ? (
//         <p>Loading...</p>
//       ) : products.length === 0 ? (
//         <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
//           <p style={{ fontSize: "1.1rem" }}>No products found.</p>
//           <p style={{ fontSize: "14px" }}>Try adjusting your search or filters.</p>
//         </div>
//       ) : (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
//           {products.map((product) => {
//             const cartItem = getCartItem(product.id);
//             return (
//               <div key={product.id} style={cardStyle}>
//                 {/* Clicking the image or name goes to detail page */}
//                 <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
//                   {product.image_url && (
//                     <img src={product.image_display || product.image_url} alt={product.name}
//                       style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "6px" }} />
//                   )}
//                   <h3 style={{ margin: "0.75rem 0 0.25rem", fontSize: "15px" }}>{product.name}</h3>
//                 </Link>
//                 {product.category_name && (
//                   <span style={categoryTagStyle}>{product.category_name}</span>
//                 )}
//                 <p style={{ color: "#6b7280", fontSize: "13px", margin: "0.4rem 0" }}>{product.description}</p>
//                 <p style={{ fontWeight: "700", color: "#111", margin: "0 0 0.75rem" }}>₹{product.price}</p>

//                 {product.stock === 0 ? (
//                   <div style={outOfStockStyle}>Out of stock</div>
//                 ) : !cartItem ? (
//                   <button onClick={() => handleAdd(product.id)} style={addBtnStyle}>Add</button>
//                 ) : (
//                   <div style={qtyRowStyle}>
//                     <button onClick={() => handleDecrease(cartItem)} style={qtyBtnStyle}>−</button>
//                     <span style={qtyNumStyle}>{cartItem.quantity}</span>
//                     <button onClick={() => handleIncrease(product.id)} style={qtyBtnStyle}>+</button>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//       <Pagination
//         currentPage={page}
//         totalCount={totalCount}
//         pageSize={8}
//         onPageChange={setPage}
//       />
//     </div>
//   );
// }

// // styles
// const filterBarStyle = { display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" };
// const inputStyle = { padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", width: "180px" };
// const clearBtnStyle = { padding: "9px 14px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#374151" };
// const categoryTagStyle = { display: "inline-block", background: "#eff6ff", color: "#2563eb", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "999px", marginBottom: "4px" };
// const cardStyle = { border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1rem", background: "#fff" };
// const addBtnStyle = { width: "100%", padding: "9px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
// const qtyRowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#eff6ff", border: "1.5px solid #2563eb", borderRadius: "8px", padding: "2px" };
// const qtyBtnStyle = { width: "36px", height: "36px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "18px", fontWeight: "700", cursor: "pointer" };
// const qtyNumStyle = { fontWeight: "700", fontSize: "16px", color: "#1d4ed8", minWidth: "30px", textAlign: "center" };
// const outOfStockStyle = { textAlign: "center", padding: "9px", background: "#f3f4f6", color: "#9ca3af", borderRadius: "8px", fontSize: "14px" };
// const viewCartStyle = { display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", background: "#2563eb", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600" };
// const badgeStyle = { background: "#fff", color: "#2563eb", borderRadius: "999px", padding: "1px 7px", fontSize: "13px", fontWeight: "700" };

// export default Products;


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Pagination from "../components/Pagination";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    api.get("/categories/").then(res => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (isLoggedIn) api.get("/cart/").then(res => setCartItems(res.data)).catch(() => setCartItems([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    api.get("/products/", { params })
      .then(res => { setProducts(res.data.results || []); setTotalCount(res.data.count || 0); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, selectedCategory, minPrice, maxPrice, page]);

  const getCartItem = (productId) => cartItems.find(item => item.product.id === productId);

  const refreshCart = async () => {
    if (isLoggedIn) { const res = await api.get("/cart/"); setCartItems(res.data); }
  };

  const handleAdd = async (productId) => {
    if (!isLoggedIn) { window.location.href = "/login"; return; }
    await api.post("/cart/add/", { product_id: productId, quantity: 1 });
    refreshCart();
  };
  const handleIncrease = async (productId) => { await api.post("/cart/add/", { product_id: productId, quantity: 1 }); refreshCart(); };
  const handleDecrease = async (cartItem) => {
    if (cartItem.quantity <= 1) await api.delete(`/cart/remove/${cartItem.id}/`);
    else await api.post("/cart/update/", { item_id: cartItem.id, quantity: cartItem.quantity - 1 });
    refreshCart();
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div style={{ background: "#f8f7f4", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ── */}
      <div style={pageHeader}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={accentBar} />
            <h1 style={pageTitle}>All Products</h1>
            {!loading && <p style={countText}>{totalCount} product{totalCount !== 1 ? "s" : ""} found</p>}
          </div>
          {isLoggedIn && (
            <Link to="/cart" style={cartBtnStyle}>
              🛒 Cart {cartCount > 0 && <span style={cartBadge}>{cartCount}</span>}
            </Link>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem 3rem" }}>

        {/* ── Filters ── */}
        <div style={filterBar}>
          <input
            type="text" placeholder="Search products..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={filterInput}
          />
          <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPage(1); }} style={filterInput}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <input type="number" placeholder="Min ₹" value={minPrice}
            onChange={e => { setMinPrice(e.target.value); setPage(1); }} style={{ ...filterInput, width: 100 }} />
          <input type="number" placeholder="Max ₹" value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); setPage(1); }} style={{ ...filterInput, width: 100 }} />
          {(search || selectedCategory || minPrice || maxPrice) && (
            <button onClick={() => { setSearch(""); setSelectedCategory(""); setMinPrice(""); setMaxPrice(""); setPage(1); }} style={clearBtn}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>No products found.</p>
            <p style={{ fontSize: 14 }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={productGrid}>
            {products.map(product => {
              const cartItem = getCartItem(product.id);
              return (
                <div key={product.id} style={cardStyle}>
                  {/* Image */}
                  <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={imgWrapper}>
                      {product.image_url ? (
                        <img src={product.image_display || product.image_url} alt={product.name} style={imgStyle} />
                      ) : (
                        <div style={imgPlaceholder}>🛍️</div>
                      )}
                      {product.stock === 0 && (
                        <div style={outOfStockOverlay}>Out of Stock</div>
                      )}
                    </div>
                  </Link>

                  {/* Card body */}
                  <div style={cardBody}>
                    {product.category_name && <span style={catTag}>{product.category_name}</span>}

                    <Link to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
                      <h3 style={productName}>{product.name}</h3>
                    </Link>

                    <p style={productDesc}>
                      {product.description?.length > 60 ? product.description.slice(0, 60) + "…" : product.description}
                    </p>

                    {/* Price + button pinned to bottom */}
                    <div style={cardFooter}>
                      <span style={priceStyle}>₹{product.price}</span>
                      {product.stock === 0 ? (
                        <div style={outOfStockBtn}>Out of stock</div>
                      ) : !cartItem ? (
                        <button onClick={() => handleAdd(product.id)} style={addBtn}>Add to Cart</button>
                      ) : (
                        <div style={qtyRow}>
                          <button onClick={() => handleDecrease(cartItem)} style={qtyBtn}>−</button>
                          <span style={qtyNum}>{cartItem.quantity}</span>
                          <button onClick={() => handleIncrease(product.id)} style={qtyBtn}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination currentPage={page} totalCount={totalCount} pageSize={8} onPageChange={setPage} />
      </div>
    </div>
  );
}

/* ── Styles ── */
const pageHeader = { background: "#fff", borderBottom: "1px solid #e8e4df", padding: "2rem 2rem 1.5rem" };
const accentBar = { width: 40, height: 3, background: "#e94560", borderRadius: 99, marginBottom: "0.75rem" };
const pageTitle = { fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "#1a1a2e", margin: 0 };
const countText = { color: "#9ca3af", fontSize: 13, marginTop: 4 };
const cartBtnStyle = { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#1a1a2e", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 };
const cartBadge = { background: "#e94560", color: "#fff", borderRadius: 99, padding: "1px 8px", fontSize: 12, fontWeight: 700 };
const filterBar = { display: "flex", gap: "0.75rem", flexWrap: "wrap", padding: "1.5rem 0", alignItems: "center" };
const filterInput = { padding: "10px 14px", border: "1px solid #e8e4df", borderRadius: 10, fontSize: 14, outline: "none", width: 180, background: "#fff", fontFamily: "'DM Sans', sans-serif" };
const clearBtn = { padding: "10px 16px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 };

/* Grid — minmax keeps all cards same width, auto-fill wraps them */
const productGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "1.25rem",
};

const cardStyle = {
  background: "#fff", border: "1px solid #e8e4df", borderRadius: 14,
  overflow: "hidden", display: "flex", flexDirection: "column",
  transition: "box-shadow 0.2s, transform 0.2s",
  boxShadow: "0 2px 8px rgba(26,26,46,0.05)",
};

const imgWrapper = { position: "relative", height: 180, overflow: "hidden", background: "#f8f7f4" };
const imgStyle = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const imgPlaceholder = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 };
const outOfStockOverlay = { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em" };

/* cardBody uses flex-column + flex:1 so footer always sticks to bottom */
const cardBody = { padding: "1rem", display: "flex", flexDirection: "column", flex: 1 };
const catTag = { display: "inline-block", background: "#eff6ff", color: "#1e40af", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99, marginBottom: 8 };
const productName = { fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 6px", lineHeight: 1.3 };
const productDesc = { fontSize: 13, color: "#9ca3af", margin: "0 0 auto", lineHeight: 1.5, paddingBottom: 12 };

/* footer always at bottom of card */
const cardFooter = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto", paddingTop: 10, borderTop: "1px solid #f3f4f6" };
const priceStyle = { fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: "#1a1a2e" };
const addBtn = { padding: "8px 16px", background: "#e94560", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };
const outOfStockBtn = { padding: "8px 12px", background: "#f3f4f6", color: "#9ca3af", borderRadius: 8, fontSize: 13, fontWeight: 500 };
const qtyRow = { display: "flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1.5px solid #93c5fd", borderRadius: 8, padding: "2px 4px" };
const qtyBtn = { width: 30, height: 30, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, fontWeight: 700, cursor: "pointer" };
const qtyNum = { fontWeight: 700, fontSize: 15, color: "#1a1a2e", minWidth: 24, textAlign: "center" };

export default Products;
