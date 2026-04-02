import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await API.post("/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      nav("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-wrapper">

      {/* Decorative blobs */}
      <div className="login-blob login-blob--1" />
      <div className="login-blob login-blob--2" />

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo__icon">⬡</span>
        </div>

        <div className="login-heading">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your admin console</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Fields */}
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
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-icon-wrap">
            <span className="input-icon">🔒</span>
            <input
              className="form-input form-input--icon form-input--pad-right"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="input-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button
          className={`btn btn--primary btn--full login-submit ${isLoading ? "btn--loading" : ""}`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="btn-spinner" />
          ) : (
            "Sign In →"
          )}
        </button>

        <p className="login-footer">
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--accent-dk)", fontWeight: 600, textDecoration: "none" }}>
                Sign Up
            </Link>
        </p>
      </div>
    </div>
  );
}