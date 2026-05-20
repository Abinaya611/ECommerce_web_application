import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

/* ─── Helpers ─────────────────────────────────────────── */
const genUUID = () => "PAY-" + Math.random().toString(36).slice(2,10).toUpperCase();
const genOrderRef = () => "ORD-" + Date.now().toString().slice(-8);

/* ─── Receipt Modal ───────────────────────────────────── */
function Receipt({ receipt, onClose }) {
  const delivery = new Date();
  delivery.setDate(delivery.getDate() + 5);
  return (
    <div style={backdropStyle}>
      <div style={{ ...modalBox, maxWidth: 420, textAlign: "center" }}>
        <div style={successCircle}>✓</div>
        <h2 style={receiptTitle}>Payment Successful!</h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: "1.5rem" }}>
          Your order has been placed successfully.
        </p>
        <div style={receiptCard}>
          {[
            ["Order ID", receipt.orderRef],
            ["Payment ID", receipt.paymentId],
            ["Amount Paid", `₹${receipt.amount}`],
            ["Method", receipt.method],
            ["Date & Time", new Date().toLocaleString()],
            ["Est. Delivery", delivery.toDateString()],
          ].map(([label, val]) => (
            <div key={label} style={receiptRow}>
              <span style={receiptLabel}>{label}</span>
              <span style={receiptVal}>{val}</span>
            </div>
          ))}
        </div>
        <div style={deliveryBadge}>
          🚚 Estimated delivery by {delivery.toDateString()}
        </div>
        <button onClick={onClose} style={doneBtn}>Done</button>
      </div>
    </div>
  );
}

/* ─── OTP Modal ───────────────────────────────────────── */
function OTPModal({ amount, onSuccess, onFail, onBack }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const verify = () => {
    if (otp !== "123456") { setError("Invalid OTP. Please try again."); return; }
    setVerifying(true);
    setError("");
    // 80% success, 20% failure
    setTimeout(() => {
      const success = Math.random() < 0.8;
      if (success) onSuccess();
      else onFail("Insufficient balance in your account.");
    }, 2000);
  };

  return (
    <div style={backdropStyle}>
      <div style={{ ...modalBox, maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={otpIcon}>🔐</div>
          <h3 style={modalTitle}>OTP Verification</h3>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
            Enter the OTP sent to your registered mobile number
          </p>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            (Use <strong>123456</strong> for demo)
          </p>
        </div>

        <div style={amountPill}>Paying ₹{amount}</div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "1.5rem 0" }}>
          {[0,1,2,3,4,5].map(i => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={otp[i] || ""}
              onChange={e => {
                const val = e.target.value.replace(/\D/g,"");
                const arr = otp.split("");
                arr[i] = val;
                const next = arr.join("").slice(0,6);
                setOtp(next);
                if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
              }}
              id={`otp-${i}`}
              style={otpBox}
            />
          ))}
        </div>

        {error && <p style={errorText}>{error}</p>}

        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {timer > 0
            ? <span style={{ fontSize: 13, color: "#9ca3af" }}>Resend OTP in {timer}s</span>
            : <button onClick={() => setTimer(30)} style={resendBtn}>Resend OTP</button>
          }
        </div>

        <button onClick={verify} disabled={otp.length < 6 || verifying}
          style={{ ...primaryBtn, opacity: otp.length < 6 ? 0.5 : 1 }}>
          {verifying ? <span>⏳ Verifying...</span> : "Verify & Pay"}
        </button>
        <button onClick={onBack} style={backBtn}>← Change Payment Method</button>
      </div>
    </div>
  );
}

/* ─── Failure Modal ───────────────────────────────────── */
function FailureModal({ reason, onRetry, onChangeMethod }) {
  return (
    <div style={backdropStyle}>
      <div style={{ ...modalBox, maxWidth: 380, textAlign: "center" }}>
        <div style={failCircle}>✕</div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize: 20, color: "#1a1a2e", margin: "1rem 0 0.5rem" }}>
          Payment Failed
        </h3>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: "0.5rem" }}>{reason}</p>
        <div style={failReasonBox}>
          <p style={{ margin: 0, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
            What went wrong?
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{reason}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button onClick={onRetry} style={primaryBtn}>🔄 Retry Payment</button>
          <button onClick={onChangeMethod} style={outlineBtn}>← Change Payment Method</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Payment Modal ──────────────────────────────── */
function PaymentModal({ total, onSuccess, onClose }) {
  const [step, setStep] = useState("method"); // method | card | upi | otp | processing | failed | success
  const [method, setMethod] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upi, setUpi] = useState("");
  const [processing, setProcessing] = useState(false);
  const [failReason, setFailReason] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [errors, setErrors] = useState({});

  const methods = [
    { id: "card", icon: "💳", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
    { id: "upi",  icon: "⚡", label: "UPI",                  sub: "GPay, PhonePe, Paytm" },
    { id: "cod",  icon: "💵", label: "Cash on Delivery",      sub: "Pay when delivered" },
    { id: "wallet",icon:"👜", label: "Wallet",                sub: "ShopVi Wallet" },
  ];

  const formatCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExpiry = v => { const c=v.replace(/\D/g,"").slice(0,4); return c.length>=3?c.slice(0,2)+"/"+c.slice(2):c; };

  const validateCard = () => {
    const e = {};
    if (card.number.replace(/\s/g,"").length < 16) e.number = "Enter valid 16-digit card number";
    if (card.expiry.length < 5) e.expiry = "Enter valid expiry";
    if (card.cvv.length < 3) e.cvv = "Enter 3-digit CVV";
    if (!card.name.trim()) e.name = "Enter cardholder name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleMethodProceed = (m) => {
    setMethod(m);
    if (m === "cod") {
      setStep("processing");
      setTimeout(() => {
        setReceipt({ orderRef: genOrderRef(), paymentId: genUUID(), amount: total.toFixed(2), method: "Cash on Delivery" });
        setStep("success");
      }, 1500);
    } else if (m === "card") {
      setStep("card");
    } else if (m === "upi") {
      setStep("upi");
    } else if (m === "wallet") {
      setStep("otp");
    }
  };

  const handleCardProceed = () => {
    if (!validateCard()) return;
    setStep("otp");
  };

  const handleUpiProceed = () => {
    if (!upi.includes("@")) { setErrors({ upi: "Enter valid UPI ID (e.g. name@upi)" }); return; }
    setStep("otp");
  };

  const handleOtpSuccess = async () => {
    setStep("processing");
    await onSuccess();
    setReceipt({
      orderRef: genOrderRef(),
      paymentId: genUUID(),
      amount: total.toFixed(2),
      method: method === "card" ? `Card ending ${card.number.slice(-4)}` : method === "upi" ? `UPI: ${upi}` : "Wallet"
    });
    setStep("success");
  };

  const handleOtpFail = (reason) => {
    setFailReason(reason);
    setStep("failed");
  };

  const methodLabel = methods.find(m => m.id === method)?.label || "";

  return (
    <>
      {/* Method selection */}
      {step === "method" && (
        <div style={backdropStyle}>
          <div style={{ ...modalBox, maxWidth: 440 }}>
            <div style={modalHeader}>
              <div>
                <h3 style={modalTitle}>Choose Payment Method</h3>
                <p style={{ color:"#9ca3af", fontSize:13, marginTop:4 }}>Secure checkout — ShopVi</p>
              </div>
              <button onClick={onClose} style={closeBtn}>✕</button>
            </div>
            <div style={amountPill}>Total: ₹{Number(total).toFixed(2)}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginTop:"1.25rem" }}>
              {methods.map(m => (
                <button key={m.id} onClick={() => handleMethodProceed(m.id)} style={methodCard}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div style={{ textAlign:"left" }}>
                    <p style={{ margin:0, fontWeight:600, fontSize:15, color:"#1a1a2e" }}>{m.label}</p>
                    <p style={{ margin:"2px 0 0", fontSize:12, color:"#9ca3af" }}>{m.sub}</p>
                  </div>
                  <span style={{ marginLeft:"auto", color:"#9ca3af", fontSize:18 }}>›</span>
                </button>
              ))}
            </div>
            <p style={{ textAlign:"center", fontSize:11, color:"#d1d5db", marginTop:"1.25rem" }}>
              🔒 256-bit encrypted — Demo mode
            </p>
          </div>
        </div>
      )}

      {/* Card form */}
      {step === "card" && (
        <div style={backdropStyle}>
          <div style={{ ...modalBox, maxWidth: 420 }}>
            <div style={modalHeader}>
              <div>
                <h3 style={modalTitle}>Card Details</h3>
                <p style={{ color:"#9ca3af", fontSize:13, marginTop:4 }}>Enter your card information</p>
              </div>
              <button onClick={() => setStep("method")} style={closeBtn}>←</button>
            </div>
            <div style={amountPill}>Paying ₹{Number(total).toFixed(2)}</div>

            <label style={fieldLabel}>Cardholder Name</label>
            <input style={fieldInput} placeholder="John Doe"
              value={card.name} onChange={e => setCard({...card, name: e.target.value})} />
            {errors.name && <p style={errorText}>{errors.name}</p>}

            <label style={fieldLabel}>Card Number</label>
            <input style={fieldInput} placeholder="1234 5678 9012 3456"
              value={card.number} maxLength={19}
              onChange={e => setCard({...card, number: formatCard(e.target.value)})} />
            {errors.number && <p style={errorText}>{errors.number}</p>}

            <div style={{ display:"flex", gap:"1rem" }}>
              <div style={{ flex:1 }}>
                <label style={fieldLabel}>Expiry</label>
                <input style={fieldInput} placeholder="MM/YY" value={card.expiry} maxLength={5}
                  onChange={e => setCard({...card, expiry: formatExpiry(e.target.value)})} />
                {errors.expiry && <p style={errorText}>{errors.expiry}</p>}
              </div>
              <div style={{ flex:1 }}>
                <label style={fieldLabel}>CVV</label>
                <input style={fieldInput} placeholder="•••" value={card.cvv} maxLength={3} type="password"
                  onChange={e => setCard({...card, cvv: e.target.value.replace(/\D/g,"").slice(0,3)})} />
                {errors.cvv && <p style={errorText}>{errors.cvv}</p>}
              </div>
            </div>

            <button onClick={handleCardProceed} style={{ ...primaryBtn, marginTop:"1.25rem" }}>
              Proceed to OTP →
            </button>
            <button onClick={() => setStep("method")} style={backBtn}>← Back</button>
          </div>
        </div>
      )}

      {/* UPI form */}
      {step === "upi" && (
        <div style={backdropStyle}>
          <div style={{ ...modalBox, maxWidth: 400 }}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Pay via UPI</h3>
              <button onClick={() => setStep("method")} style={closeBtn}>←</button>
            </div>
            <div style={amountPill}>Paying ₹{Number(total).toFixed(2)}</div>
            <div style={{ display:"flex", gap:"0.75rem", justifyContent:"center", margin:"1.25rem 0" }}>
              {["GPay","PhonePe","Paytm","BHIM"].map(app => (
                <div key={app} style={upiAppChip}>{app}</div>
              ))}
            </div>
            <label style={fieldLabel}>UPI ID</label>
            <input style={fieldInput} placeholder="yourname@upi"
              value={upi} onChange={e => setUpi(e.target.value)} />
            {errors.upi && <p style={errorText}>{errors.upi}</p>}
            <button onClick={handleUpiProceed} style={{ ...primaryBtn, marginTop:"1.25rem" }}>
              Verify UPI →
            </button>
            <button onClick={() => setStep("method")} style={backBtn}>← Back</button>
          </div>
        </div>
      )}

      {/* OTP */}
      {step === "otp" && (
        <OTPModal
          amount={Number(total).toFixed(2)}
          onSuccess={handleOtpSuccess}
          onFail={handleOtpFail}
          onBack={() => setStep(method === "wallet" ? "method" : method === "card" ? "card" : "upi")}
        />
      )}

      {/* Processing */}
      {step === "processing" && (
        <div style={backdropStyle}>
          <div style={{ ...modalBox, maxWidth:360, textAlign:"center" }}>
            <div style={spinnerWrap}><div style={spinner} /></div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#1a1a2e", margin:"1rem 0 0.5rem" }}>
              Processing Payment
            </h3>
            <p style={{ color:"#9ca3af", fontSize:14 }}>Please wait, do not close this window...</p>
          </div>
        </div>
      )}

      {/* Failed */}
      {step === "failed" && (
        <FailureModal
          reason={failReason}
          onRetry={() => setStep("otp")}
          onChangeMethod={() => { setStep("method"); setMethod(""); }}
        />
      )}

      {/* Receipt / Success */}
      {step === "success" && receipt && (
        <Receipt receipt={receipt} onClose={onClose} />
      )}
    </>
  );
}

/* ─── Smart Budget Banner (shown above product list) ──── */
export function BudgetBar({ budget, setBudget, cartTotal, onExceed }) {
  const [input, setInput] = useState("");
  // Read from localStorage on mount
  const [active, setActive] = useState(() => !!localStorage.getItem("shopvi_budget"));

  useEffect(() => {
    const saved = localStorage.getItem("shopvi_budget");
    if (saved) { setBudget(parseFloat(saved)); setActive(true); }
  }, []);

  const activate = () => {
    const b = parseFloat(input);
    if (!b || b <= 0) return;
    localStorage.setItem("shopvi_budget", b);
    setBudget(b);
    setActive(true);
  };

  const clear = () => {
    localStorage.removeItem("shopvi_budget");
    setBudget(0); setActive(false); setInput("");
  };
  const pct = budget > 0 ? Math.min((cartTotal / budget) * 100, 100) : 0;
  const over = active && budget > 0 && cartTotal > budget;
  const near = active && budget > 0 && cartTotal >= budget * 0.85 && cartTotal <= budget;

  return (
    <div style={{ ...budgetBarWrap, borderColor: over ? "#fca5a5" : near ? "#fde68a" : "#e8e4df", background: over ? "#fff5f5" : near ? "#fffbeb" : "#fff" }}>
      <div style={{ display:"flex", gap:"0.75rem", alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ fontSize:14, fontWeight:600, color:"#1a1a2e" }}>💡 Smart Budget</span>
        {!active ? (
          <>
            <input type="number" placeholder="Set your budget (₹)" value={input}
              onChange={e => setInput(e.target.value)}
              style={{ padding:"8px 12px", border:"1px solid #e8e4df", borderRadius:8, fontSize:14, width:200, fontFamily:"'DM Sans',sans-serif" }} />
            <button onClick={activate} style={setBudgetBtn}>Set Budget</button>
          </>
        ) : (
          <>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span style={{ color: over?"#dc2626":near?"#d97706":"#6b7280" }}>
                  ₹{cartTotal.toFixed(0)} / ₹{budget.toFixed(0)}
                </span>
                <span style={{ color: over?"#dc2626":"#6b7280", fontWeight:600 }}>
                  {over ? `₹${(cartTotal-budget).toFixed(0)} over!` : `₹${(budget-cartTotal).toFixed(0)} left`}
                </span>
              </div>
              <div style={progressTrack}>
                <div style={{ ...progressFill, width:`${pct}%`, background: over?"#ef4444":near?"#f59e0b":"#22c55e" }} />
              </div>
            </div>
            <button onClick={clear} style={clearBudgetBtn}>✕ Clear</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Cart ───────────────────────────────────────── */
function Cart() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [budget, setBudget] = useState(0);
  const [exceedWarning, setExceedWarning] = useState(null); // { amount, itemId }
  const isLoggedIn = !!localStorage.getItem("access_token");

  const fetchData = async () => {
    const [cartRes, orderRes] = await Promise.all([api.get("/cart/"), api.get("/orders/history/")]);
    setItems(cartRes.data);
    setOrders(orderRes.data);
    setLoading(false);
  };

  useEffect(() => { if (isLoggedIn) fetchData(); else setLoading(false); }, []);

  const removeItem = async (itemId) => {
    await api.delete(`/cart/remove/${itemId}/`);
    setExceedWarning(null);
    fetchData();
  };

  const handlePaymentSuccess = async () => {
    await api.post("/orders/place/");
    setOrderPlaced(true);
    fetchData();
  };

  const handleExceed = (overBy) => {
    // find the most recently added / most expensive item
    if (items.length === 0) return;
    const sorted = [...items].sort((a,b) => b.product.price - a.product.price);
    setExceedWarning({ overBy: overBy.toFixed(2), item: sorted[0] });
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!isLoggedIn) return <div style={centerPage}><p>Please <Link to="/login" style={{ color:"#e94560" }}>login</Link> to view your cart.</p></div>;
  if (loading) return <div style={centerPage}><p>Loading...</p></div>;

  return (
    <div style={{ background:"#f8f7f4", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      {showPayment && (
        <PaymentModal
          total={total}
          onSuccess={handlePaymentSuccess}
          onClose={() => { setShowPayment(false); if (orderPlaced) fetchData(); }}
        />
      )}

      {/* Page header */}
      <div style={pageHeader}>
        <div>
          <div style={accentBar} />
          <h1 style={pageTitle}>Your Cart</h1>
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"2rem" }}>

        {/* Budget bar */}
        <BudgetBar
          budget={budget}
          setBudget={setBudget}
          cartTotal={total}
          onExceed={handleExceed}
        />

        {/* Exceed warning toast */}
        {exceedWarning && (
            <div style={exceedPanel}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                <div>
                  <p style={{ margin:0, fontWeight:700, fontSize:15, color:"#991b1b" }}>
                    ⚠️ Over budget by ₹{exceedWarning.overBy}
                  </p>
                  <p style={{ margin:"4px 0 0", fontSize:13, color:"#6b7280" }}>
                    Remove items one by one until the warning clears
                  </p>
                </div>
                <button onClick={() => setExceedWarning(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#9ca3af" }}>✕</button>
              </div>

              {/* Show ALL cart items with remove buttons */}
              {items.map(item => (
                <div key={item.id} style={exceedItemRow}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:600, fontSize:14, color:"#1a1a2e" }}>{item.product.name}</p>
                    <p style={{ margin:"2px 0 0", fontSize:12, color:"#9ca3af" }}>
                      ₹{item.product.price} × {item.quantity} = ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={removeToastBtn}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

        {orderPlaced && (
          <div style={successBanner}>✅ Order placed! Check "My Orders" for status.</div>
        )}

        {items.length === 0 ? (
          <div style={emptyBox}>
            <span style={{ fontSize:52 }}>🛒</span>
            <p style={{ fontWeight:600, fontSize:18, color:"#1a1a2e", margin:"1rem 0 0.5rem" }}>Your cart is empty</p>
            <Link to="/products" style={shopBtn}>Browse Products →</Link>
          </div>
        ) : (
          <div style={{ display:"flex", gap:"2rem", flexWrap:"wrap", alignItems:"flex-start" }}>
            {/* Items list */}
            <div style={{ flex:"1 1 400px" }}>
              {items.map(item => (
                <div key={item.id} style={cartRow}>
                  {item.product.image_url && (
                    <img src={item.product.image_display || item.product.image_url}
                      alt={item.product.name}
                      style={{ width:72, height:72, objectFit:"cover", borderRadius:10, flexShrink:0 }} />
                  )}
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:600, fontSize:15, color:"#1a1a2e" }}>{item.product.name}</p>
                    <p style={{ margin:"4px 0 0", fontSize:13, color:"#9ca3af" }}>₹{item.product.price} × {item.quantity}</p>
                    <p style={{ margin:"4px 0 0", fontWeight:700, color:"#e94560", fontSize:14 }}>
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={removeBtn}>Remove</button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={summaryBox}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:"#1a1a2e", marginBottom:"1.25rem" }}>
                Order Summary
              </h3>
              <div style={summaryRow}>
                <span style={{ color:"#6b7280", fontSize:14 }}>Subtotal ({items.length} item{items.length>1?"s":""})</span>
                <span style={{ fontWeight:600 }}>₹{total.toFixed(2)}</span>
              </div>
              <div style={summaryRow}>
                <span style={{ color:"#6b7280", fontSize:14 }}>Delivery</span>
                <span style={{ color:"#16a34a", fontWeight:600, fontSize:13 }}>FREE</span>
              </div>
              {budget > 0 && (
                <div style={summaryRow}>
                  <span style={{ color:"#6b7280", fontSize:14 }}>Budget</span>
                  <span style={{ fontWeight:600, color: total > budget ? "#dc2626" : "#16a34a" }}>
                    ₹{budget.toFixed(0)} {total > budget ? "⚠️" : "✅"}
                  </span>
                </div>
              )}
              <div style={summaryDivider} />
              <div style={summaryRow}>
                <span style={{ fontWeight:700, fontSize:16 }}>Total</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:22, color:"#1a1a2e" }}>
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <button onClick={() => setShowPayment(true)} style={checkoutBtn}>
                Proceed to Pay →
              </button>
            </div>
          </div>
        )}

        {/* Order History */}
        {orders.length > 0 && (
          <div style={{ marginTop:"3rem" }}>
            <div style={accentBar} />
            <h2 style={pageTitle}>Order History</h2>
            <div style={{ marginTop:"1.25rem" }}>
              {orders.map(order => (
                <div key={order.id} style={orderCard}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                    <span style={{ fontWeight:700, fontSize:15, color:"#1a1a2e" }}>Order #{order.id}</span>
                    <span style={statusBadge(order.status)}>{order.status}</span>
                  </div>
                  {order.items.map(item => (
                    <p key={item.id} style={{ margin:"4px 0", fontSize:14, color:"#374151" }}>
                      {item.product_name} × {item.quantity} — ₹{item.price_at_purchase}
                    </p>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:"0.75rem", paddingTop:"0.75rem", borderTop:"1px solid #f3f4f6" }}>
                    <span style={{ fontSize:12, color:"#9ca3af" }}>{new Date(order.created_at).toLocaleString()}</span>
                    <span style={{ fontWeight:700, fontSize:15, color:"#1a1a2e" }}>₹{Number(order.total_price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const backdropStyle = { position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" };
const modalBox = { background:"#fff", borderRadius:18, padding:"2rem", width:"100%", boxShadow:"0 24px 60px rgba(0,0,0,0.25)", maxHeight:"90vh", overflowY:"auto" };
const modalHeader = { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.25rem" };
const modalTitle = { fontFamily:"'Playfair Display',serif", fontSize:20, color:"#1a1a2e", margin:0 };
const closeBtn = { background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#9ca3af", padding:"4px 8px", flexShrink:0 };
const amountPill = { background:"#fff5f6", border:"1px solid #fecdd3", borderRadius:10, padding:"10px 16px", textAlign:"center", fontWeight:700, fontSize:16, color:"#e94560" };
const methodCard = { display:"flex", alignItems:"center", gap:"1rem", padding:"1rem 1.25rem", background:"#fafafa", border:"1px solid #e8e4df", borderRadius:12, cursor:"pointer", width:"100%", transition:"border-color 0.15s, background 0.15s", fontFamily:"'DM Sans',sans-serif" };
const primaryBtn = { width:"100%", padding:"13px", background:"#e94560", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
const outlineBtn = { width:"100%", padding:"11px", background:"transparent", color:"#374151", border:"1.5px solid #e8e4df", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
const backBtn = { width:"100%", padding:"10px", background:"none", color:"#9ca3af", border:"none", fontSize:13, cursor:"pointer", marginTop:"0.5rem", fontFamily:"'DM Sans',sans-serif" };
const fieldLabel = { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:5, marginTop:12 };
const fieldInput = { width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid #e8e4df", fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif" };
const errorText = { color:"#e94560", fontSize:12, margin:"4px 0 0" };
const upiAppChip = { background:"#f3f4f6", padding:"6px 14px", borderRadius:8, fontSize:13, fontWeight:600, color:"#374151" };

const otpIcon = { fontSize:40, marginBottom:8 };
const otpBox = { width:44, height:52, textAlign:"center", fontSize:20, fontWeight:700, border:"2px solid #e8e4df", borderRadius:10, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#1a1a2e" };
const resendBtn = { background:"none", border:"none", color:"#e94560", fontSize:13, fontWeight:600, cursor:"pointer" };

const spinnerWrap = { display:"flex", justifyContent:"center", margin:"1.5rem 0" };
const spinner = { width:48, height:48, border:"4px solid #f3f4f6", borderTop:"4px solid #e94560", borderRadius:"50%", animation:"spin 0.8s linear infinite" };

const successCircle = { width:72, height:72, borderRadius:"50%", background:"#dcfce7", color:"#16a34a", fontSize:32, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", fontWeight:700 };
const receiptTitle = { fontFamily:"'Playfair Display',serif", fontSize:22, color:"#1a1a2e", margin:"0 0 0.5rem" };
const receiptCard = { background:"#f8f7f4", borderRadius:12, padding:"1rem", margin:"1rem 0", textAlign:"left" };
const receiptRow = { display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #e8e4df" };
const receiptLabel = { fontSize:13, color:"#9ca3af" };
const receiptVal = { fontSize:13, fontWeight:600, color:"#1a1a2e", maxWidth:200, textAlign:"right" };
const deliveryBadge = { background:"#eff6ff", color:"#1e40af", padding:"10px 16px", borderRadius:10, fontSize:13, fontWeight:600, margin:"1rem 0" };
const doneBtn = { width:"100%", padding:"13px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };

const failCircle = { width:72, height:72, borderRadius:"50%", background:"#fee2e2", color:"#dc2626", fontSize:28, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 0.5rem", fontWeight:700 };
const failReasonBox = { background:"#fff5f5", border:"1px solid #fecaca", borderRadius:10, padding:"0.75rem 1rem", margin:"1rem 0", textAlign:"left" };

// Budget bar
const budgetBarWrap = { border:"1px solid", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1rem", transition:"all 0.3s" };
const setBudgetBtn = { padding:"8px 18px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" };
const clearBudgetBtn = { padding:"6px 12px", background:"#fee2e2", color:"#991b1b", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" };
const progressTrack = { height:6, background:"#e8e4df", borderRadius:99, overflow:"hidden" };
const progressFill = { height:"100%", borderRadius:99, transition:"width 0.4s, background 0.4s" };
const exceedToast = { display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem", background:"#fff5f5", border:"1.5px solid #fca5a5", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1rem" };
const removeToastBtn = { padding:"8px 16px", background:"#fee2e2", color:"#991b1b", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 };

// Cart layout
const pageHeader = { background:"#fff", borderBottom:"1px solid #e8e4df", padding:"2rem" };
const accentBar = { width:40, height:3, background:"#e94560", borderRadius:99, marginBottom:"0.75rem" };
const pageTitle = { fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", color:"#1a1a2e", margin:0 };
const cartRow = { display:"flex", alignItems:"center", gap:"1rem", padding:"1.25rem", background:"#fff", borderRadius:14, marginBottom:"1rem", border:"1px solid #e8e4df", boxShadow:"0 2px 8px rgba(26,26,46,0.04)" };
const removeBtn = { padding:"7px 14px", background:"#fee2e2", color:"#991b1b", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, flexShrink:0 };
const summaryBox = { flex:"0 0 280px", background:"#fff", border:"1px solid #e8e4df", borderRadius:14, padding:"1.5rem", boxShadow:"0 4px 20px rgba(26,26,46,0.07)", position:"sticky", top:"5rem" };
const summaryRow = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" };
const summaryDivider = { borderTop:"1.5px solid #e8e4df", margin:"0.75rem 0" };
const checkoutBtn = { width:"100%", padding:"13px", background:"#e94560", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", marginTop:"0.75rem", fontFamily:"'DM Sans',sans-serif" };
const successBanner = { background:"#dcfce7", color:"#166534", padding:"12px 16px", borderRadius:10, marginBottom:"1.5rem", fontWeight:600 };
const emptyBox = { display:"flex", flexDirection:"column", alignItems:"center", padding:"4rem 2rem", background:"#fff", borderRadius:16, border:"1px solid #e8e4df", textAlign:"center" };
const shopBtn = { padding:"12px 28px", background:"#e94560", color:"#fff", borderRadius:10, textDecoration:"none", fontSize:15, fontWeight:600, marginTop:8 };
const orderCard = { background:"#fff", border:"1px solid #e8e4df", borderRadius:12, padding:"1.25rem", marginBottom:"1rem" };
const centerPage = { display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", fontFamily:"'DM Sans',sans-serif", fontSize:16, color:"#6b7280" };

const statusBadge = s => ({
  padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:700,
  background: s==="delivered"?"#dcfce7":s==="shipped"?"#dbeafe":s==="confirmed"?"#ede9fe":"#fef9c3",
  color: s==="delivered"?"#166534":s==="shipped"?"#1e40af":s==="confirmed"?"#5b21b6":"#854d0e"
});

// Spinner keyframes — inject once
const styleTag = document.createElement("style");
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);
const exceedPanel = { background:"#fff5f5", border:"1.5px solid #fca5a5", borderRadius:12, padding:"1.25rem", marginBottom:"1.25rem" };
const exceedItemRow = { display:"flex", alignItems:"center", gap:"1rem", padding:"0.75rem 0", borderBottom:"1px solid #fee2e2" };
export default Cart;
