import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./Auth.css";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const registerUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });

      alert("Account created successfully! Please login.");
      window.location.href = "/login";
    } catch (err) {
      console.log(err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>

      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">TC</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your journey with TripCraft AI</p>
        </div>

        <form className="auth-form" onSubmit={registerUser}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Create a password (min 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Creating Account...
              </>
            ) : (
              <>Sign Up</>
            )}
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
