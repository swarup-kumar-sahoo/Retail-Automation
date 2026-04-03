import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [scanFlash, setScanFlash] = useState(false);

  const scannerRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    fetchCart();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      setCart(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  // ── NEW: Remove a single item ──
  const removeItem = async (productId) => {
    try {
      await API.delete(`/clear-cart/${productId}`);
      fetchCart();
    } catch (err) {
      console.error("Remove item error", err);
    }
  };

  // ── NEW: Clear entire cart ──
  const clearCart = async () => {
    try {
      await API.delete("/clear-cart");
      fetchCart();
    } catch (err) {
      console.error("Clear cart error", err);
    }
  };

  const startScanner = async () => {
    try {
      scannerRef.current = new Html5Qrcode("reader");

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          try {
            // 🛑 STOP immediately after first scan
            await scannerRef.current.stop();
            setScannerRunning(false);

            // Call API
            await API.post(`/scan/${decodedText}`);

            setLastScanned(decodedText);
            setScanFlash(true);
            setTimeout(() => setScanFlash(false), 800);

            fetchCart();
          } catch (err) {
            console.error("Scan API error", err);
          }
        }
      );

      setScannerRunning(true);
    } catch (err) {
      console.error("Scanner start error", err);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) await scannerRef.current.stop();
      setScannerRunning(false);
    } catch (err) {
      console.error("Scanner stop error", err);
    }
  };

  const handleLogout = async () => {
    try {
      if (scannerRef.current) await scannerRef.current.stop().catch(() => {});
    } catch (err) {}
    localStorage.removeItem("token");
    nav("/");
  };

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="dash-wrapper">

      {/* ── HEADER ── */}
      <header className="dash-header">
        <div className="dash-header__left">
          <div className="admin-logo">
            <span className="admin-logo__icon">⬡</span>
          </div>
          <div>
            <h1 className="admin-title">Smart Retail</h1>
            <p className="admin-subtitle">Customer Dashboard</p>
          </div>
        </div>

        <div className="dash-header__right">
          {itemCount > 0 && (
            <div className="cart-pill">
              <span className="cart-pill__icon">🛒</span>
              <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
            </div>
          )}
          <button className="btn btn--danger btn--sm" onClick={handleLogout}>
            ⎋ Logout
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="dash-body">

        {/* Scanner Panel */}
        <section className="panel dash-scanner-panel">
          <div className="panel__header">
            <span className="panel__icon">◎</span>
            <h2 className="panel__title">Scan Product</h2>
          </div>

          <div className={`scanner-viewport ${scanFlash ? "scanner-viewport--flash" : ""}`}>
            <div id="reader" className={`scanner-reader ${scannerRunning ? "scanner-reader--active" : ""}`} />

            {!scannerRunning && (
              <div className="scanner-idle">
                <span className="scanner-idle__icon">📷</span>
                <p className="scanner-idle__text">Camera is off</p>
                <p className="scanner-idle__hint">Press Start to scan a product QR</p>
              </div>
            )}
          </div>

          {lastScanned && (
            <div className="scan-result">
              <span className="scan-result__dot" />
              Last scanned: <strong>{lastScanned}</strong>
            </div>
          )}

          <div className="scanner-controls">
            {!scannerRunning ? (
              <button className="btn btn--primary btn--full" onClick={startScanner}>
                ▶ Start Scanner
              </button>
            ) : (
              <button className="btn btn--danger btn--full" onClick={stopScanner}>
                ■ Stop Scanner
              </button>
            )}
          </div>
        </section>

        {/* Cart Panel */}
        <section className="panel dash-cart-panel">
          <div className="panel__header">
            <span className="panel__icon">🛒</span>
            <h2 className="panel__title">Cart</h2>
            {cart.length > 0 && (
              <span className="cart-count-badge">{cart.length}</span>
            )}
            {/* ── NEW: Clear All button in header ── */}
            {cart.length > 0 && (
              <button
                className="btn btn--danger btn--sm"
                style={{ marginLeft: "auto" }}
                onClick={clearCart}
              >
                🗑 Clear All
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty__icon">🧺</span>
              <p>Your cart is empty</p>
              <p className="cart-empty__hint">Scan a product to add it here</p>
            </div>
          ) : (
            <div className="cart-list">
              {cart.map((item, idx) => (
                <div
                  key={item.product_id}
                  className="cart-item"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__id">#{item.product_id}</p>
                  </div>
                  <div className="cart-item__right">
                    <span className="cart-item__qty">×{item.quantity}</span>
                    <span className="cart-item__price">₹{item.price * item.quantity}</span>
                    {/* ── NEW: Per-item remove button ── */}
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => removeItem(item.product_id)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {cart.length > 0 && (
            <div className="cart-total">
              <div className="cart-total__row">
                <span className="cart-total__label">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </span>
                <span className="cart-total__divider" />
                <span className="cart-total__amount">₹{total}</span>
              </div>
              <button className="btn btn--primary btn--full cart-checkout-btn">
                Proceed to Checkout →
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}