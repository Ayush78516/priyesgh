import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  // Token/email missing — show invalid link state immediately
  if (!token || !email) {
    return (
      <div className="lp__wrapper">
        <div className="lp__bg-circle lp__bg-circle--1" />
        <div className="lp__bg-circle lp__bg-circle--2" />
        <div className="lp__bg-circle lp__bg-circle--3" />
        <div className="lp__card" style={{ textAlign: "center" }}>
          <div className="lp__logo-wrap">
            <Link to="/"><img src="/assets/Logo.avif" alt="COV Logo" className="lp__logo" /></Link>
          </div>
          <h1 className="lp__title">Invalid Link</h1>
          <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.7", marginBottom: "28px" }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="lp__submit-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "15px" }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      } else {
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="lp__wrapper">
      <div className="lp__bg-circle lp__bg-circle--1" />
      <div className="lp__bg-circle lp__bg-circle--2" />
      <div className="lp__bg-circle lp__bg-circle--3" />

      <div className="lp__card">

        {/* Logo */}
        <div className="lp__logo-wrap">
          <Link to="/">
            <img src="/assets/Logo.avif" alt="COV Logo" className="lp__logo" />
          </Link>
        </div>

        {status !== "success" ? (
          <>
            <h1 className="lp__title">Reset Password</h1>
            <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
              Enter your new password below.
            </p>

            {status === "error" && (
              <div className="lp__error">{message}</div>
            )}

            <form onSubmit={handleSubmit} className="lp__form">

              {/* New Password */}
              <div className="lp__field-group">
                <label className="lp__label">New Password</label>
                <div className="lp__input-wrap">
                  <span className="lp__input-icon">🔒</span>
                  <input
                    id="rp-new-password"
                    type={showNew ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setMessage(""); }}
                    className="lp__input lp__input--has-eye"
                    required
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="lp__eye-btn">
                    {showNew ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="lp__field-group">
                <label className="lp__label">Confirm New Password</label>
                <div className="lp__input-wrap">
                  <span className="lp__input-icon">🔒</span>
                  <input
                    id="rp-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setMessage(""); }}
                    className="lp__input lp__input--has-eye"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="lp__eye-btn">
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Strength hint */}
              {newPassword.length > 0 && (
                <p className="lp__otp-hint">
                  {newPassword.length < 8
                    ? "⚠ Too short — minimum 8 characters"
                    : newPassword.length < 12
                    ? "✓ Good password"
                    : "✓✓ Strong password"}
                </p>
              )}

              <button
                type="submit"
                id="rp-submit"
                className="lp__submit-btn"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Resetting…" : "Reset Password"}
              </button>

              <div className="lp__footer-links" style={{ justifyContent: "center" }}>
                <Link to="/login" className="lp__forgot-link">
                  ← Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          /* ── Success State ── */
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg,#002b5b,#00a6a6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: "32px"
            }}>
              ✓
            </div>
            <h1 className="lp__title" style={{ marginBottom: "12px" }}>Password Reset!</h1>
            <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.7", marginBottom: "8px" }}>
              {message}
            </p>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "28px" }}>
              Redirecting you to login in 3 seconds…
            </p>
            <Link to="/login" className="lp__submit-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "15px" }}>
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
