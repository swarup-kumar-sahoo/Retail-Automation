import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSignup = async () => {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/signup", { email, password });
      nav("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Decorative blobs */}
      <div className="login-blob login-blob--1" />
      <div className="login-blob login-blob--2" />

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">⬡</div>

        {/* Heading */}
        <div className="login-heading">
          <h1 className="login-title">Create account</h1>
          <p className="login-subtitle">Join Smart Retail to start shopping</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email address</label>
          <div className="input-icon-wrap">
            <span className="input-icon">✉</span>
            <input
              className="form-input form-input--icon"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-icon-wrap">
            <span className="input-icon">⚿</span>
            <input
              className="form-input form-input--icon form-input--pad-right"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
            <button
              className="input-toggle"
              type="button"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label">Confirm password</label>
          <div className="input-icon-wrap">
            <span className="input-icon">⚿</span>
            <input
              className="form-input form-input--icon form-input--pad-right"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
            <button
              className="input-toggle"
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          className={`btn btn--primary btn--full login-submit ${loading ? "btn--loading" : ""}`}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              Creating account…
            </>
          ) : (
            "Create account →"
          )}
        </button>

        {/* Footer */}
        <p className="login-footer">
          Already have an account?{" "}
          <Link to="/" style={{ color: "var(--accent-dk)", fontWeight: 600, textDecoration: "none" }}>
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}