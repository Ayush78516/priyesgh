import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      } else {
        setStatus("success");
        setMessage(data.message);
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

        <h1 className="lp__title">Forgot Password</h1>

        {status !== "success" ? (
          <>
            <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
              Enter the email address linked to your account and we'll send you a link to reset your password.
            </p>

            {status === "error" && (
              <div className="lp__error">{message}</div>
            )}

            <form onSubmit={handleSubmit} className="lp__form">
              <div className="lp__field-group">
                <label className="lp__label">Email Address</label>
                <div className="lp__input-wrap">
                  <span className="lp__input-icon">✉</span>
                  <input
                    id="fp-email"
                    type="email"
                    name="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="lp__input"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                className="lp__submit-btn"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending Reset Link…" : "Send Reset Link"}
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
              ✉
            </div>
            <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.7", marginBottom: "28px" }}>
              {message}
            </p>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "28px" }}>
              Didn't receive it? Check your spam folder or&nbsp;
              <button
                onClick={() => { setStatus("idle"); setMessage(""); setEmail(""); }}
                style={{ background: "none", border: "none", color: "var(--accent-teal)", fontWeight: "600", cursor: "pointer", fontSize: "13px", padding: 0 }}
              >
                try again
              </button>.
            </p>
            <Link to="/login" className="lp__submit-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "15px" }}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
