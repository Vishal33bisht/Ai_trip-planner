import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userEmail", email);
        window.location.href = "/";
      } else {
        setError(data.detail || "Invalid email or password");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated Background */}
      <div className="auth-background"></div>
      
      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {/* Auth Card */}
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">✈️</div>
          <h1 className="auth-title">Welcome Back!</h1>
          <p className="auth-subtitle">Login to plan your next adventure</p>
        </div>

        <form className="auth-form" onSubmit={loginUser}>
          {error && <div className="error-message">❌ {error}</div>}

          <div className="form-group">
            <label className="form-label">📧 Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">🔒 Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Logging in...
              </>
            ) : (
              <>🚀 Login</>
            )}
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
