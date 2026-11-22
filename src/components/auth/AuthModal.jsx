import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  LogIn,
  UserPlus,
  KeyRound,
  Shield,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AuthModal({ isOpen, onClose, initialMode = "login", onLoginSuccess }) {
  const { loginUser, registerUser, resetPassword, quickDemoLogin } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        await loginUser(email, password);
        addToast("Welcome back! Signed in successfully.", "success");
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      } else if (mode === "register") {
        if (!name.trim()) throw new Error("Please enter your full name.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        await registerUser(email, password, { name, phone, address });
        addToast("Account created successfully! Welcome to Grand Horizon Hall.", "success");
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      } else if (mode === "forgot") {
        await resetPassword(email);
        addToast("Password reset link sent to your email.", "info");
        setMode("login");
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setErrorMsg("");
    try {
      await quickDemoLogin(role);
      addToast(`Logged in as Demo ${role === "admin" ? "Administrator" : "Customer"}.`, "success");
      onClose();
      if (onLoginSuccess) onLoginSuccess(role);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-brand-badge">GH</div>
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="auth-tabs-row">
          <button
            type="button"
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-body">
          {mode === "register" && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control with-icon"
                    required
                    placeholder="e.g. Anand Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    className="form-control with-icon"
                    required
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Residential / Postal Address</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control with-icon"
                    placeholder="City, State, Pin Code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-control with-icon"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="form-group">
              <div className="label-with-link">
                <label className="form-label">Password *</label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="link-btn-text"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg("");
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-control with-icon"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              "Processing..."
            ) : mode === "login" ? (
              <>Sign In to Account <ArrowRight size={18} /></>
            ) : mode === "register" ? (
              <>Create Account <UserPlus size={18} /></>
            ) : (
              <>Send Reset Link <KeyRound size={18} /></>
            )}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="demo-login-box">
          <span className="demo-login-label">Quick Demo Access (One-Click)</span>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn btn-secondary btn-sm demo-btn"
              onClick={() => handleQuickDemo("admin")}
              disabled={loading}
            >
              <Shield size={14} className="gold-icon" />
              Admin Portal Demo
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm demo-btn"
              onClick={() => handleQuickDemo("user")}
              disabled={loading}
            >
              <User size={14} />
              Customer Demo
            </button>
          </div>
        </div>

        {mode === "forgot" && (
          <div className="auth-back-row">
            <button
              type="button"
              className="link-btn-text"
              onClick={() => setMode("login")}
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
