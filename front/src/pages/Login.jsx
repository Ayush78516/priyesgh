import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCMS } from "../hooks/useCMS";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const cms = useCMS();
  const [activeTab, setActiveTab] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otpData, setOtpData] = useState({ email: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleOtpChange = (e) => {
    setOtpData({ ...otpData, [e.target.name]: e.target.value });
    setError("");
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      // Block admins from logging in through the user login page
      if (data.role === "admin" || data.role === "super-admin") {
        setError("Admin accounts must log in via the Admin Login page.");
        return;
      }
      login(data.token, data.refreshToken, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        email: formData.email,
        tempMembershipId: data.tempMembershipId
      }, false);
      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!otpData.email) { setError("Please enter your email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpData.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setOtpSent(true);
      if (data.devOtp) {
        setError(`SMTP unavailable locally. Use OTP: ${data.devOtp}`);
      } else {
        setError("");
      }
    } catch (err) {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpData),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      // Block admins from logging in through the user login page
      if (data.role === "admin" || data.role === "super-admin") {
        setError("Admin accounts must log in via the Admin Login page.");
        return;
      }
      login(data.token, data.refreshToken || "", {
        email: otpData.email,
      }, false);
      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

        <h1 className="lp__title">{cms("login_title", "Member Login")}</h1>

        {/* Tabs */}
        <div className="lp__tabs">
          <button
            className={`lp__tab${activeTab === "password" ? " lp__tab--active" : ""}`}
            onClick={() => { setActiveTab("password"); setError(""); }}
          >
            <span className="lp__tab-icon">🔒</span> {cms("login_tab1_label", "Login with Password")}
          </button>
          <button
            className={`lp__tab${activeTab === "otp" ? " lp__tab--active" : ""}`}
            onClick={() => { setActiveTab("otp"); setError(""); }}
          >
            <span className="lp__tab-icon">💬</span> {cms("login_tab2_label", "Login with OTP")}
          </button>
        </div>

        {/* Error */}
        {error && <div className="lp__error">{error}</div>}

        {/* Password Login */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordLogin} className="lp__form">

            <div className="lp__field-group">
              <label className="lp__label">Email</label>
              <div className="lp__input-wrap">
                <span className="lp__input-icon">✉</span>
                <input
                  type="email" name="email"
                  placeholder={cms("login_email_ph", "Enter a valid email address")}
                  value={formData.email} onChange={handleChange}
                  className="lp__input" required
                />
              </div>
            </div>

            <div className="lp__field-group">
              <label className="lp__label">Password</label>
              <div className="lp__input-wrap">
                <span className="lp__input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password" placeholder={cms("login_pass_ph", "Enter your password")}
                  value={formData.password} onChange={handleChange}
                  className="lp__input lp__input--has-eye" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="lp__eye-btn">
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button type="submit" className="lp__submit-btn" disabled={loading}>
              {loading ? "Logging in..." : cms("login_btn_label", "LOGIN")}
            </button>

            <div className="lp__footer-links">
              <Link to="/forgot-password" className="lp__forgot-link">{cms("login_forgot_text", "Forgot password?")}</Link>
              <span className="lp__create-text">
                {cms("login_create_text", "Don't have an account?")}{" "}
                <Link to="/register" className="lp__create-link">{cms("login_create_link", "Create an account")}</Link>
              </span>
            </div>
          </form>
        )}

        {/* OTP Login */}
        {activeTab === "otp" && (
          <form onSubmit={handleOtpLogin} className="lp__form">

            <div className="lp__field-group">
              <label className="lp__label">Email</label>
              <div className="lp__input-wrap">
                <span className="lp__input-icon">✉</span>
                <input
                  type="email" name="email"
                  placeholder={cms("login_email_ph", "Enter a valid email address")}
                  value={otpData.email} onChange={handleOtpChange}
                  className="lp__input lp__input--has-btn" required
                />
                <button type="button" onClick={sendOtp} className="lp__send-otp-btn" disabled={loading}>
                  {otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="lp__field-group">
                <label className="lp__label">OTP</label>
                <div className="lp__input-wrap">
                  <span className="lp__input-icon">🔑</span>
                  <input
                    type="text" name="otp"
                    placeholder={cms("login_otp_hint", "Enter 6-digit OTP")}
                    value={otpData.otp} onChange={handleOtpChange}
                    className="lp__input" maxLength={6} required
                  />
                </div>
                <p className="lp__otp-hint">{cms("login_otp_hint", "OTP sent to your email. Valid for 10 minutes.")}</p>
              </div>
            )}

            <button type="submit" className="lp__submit-btn" disabled={loading || !otpSent}>
              {loading ? "Verifying..." : cms("login_btn_label", "LOGIN")}
            </button>

            <div className="lp__footer-links">
              <span />
              <span className="lp__create-text">
                {cms("login_create_text", "Don't have an account?")}{" "}
                <Link to="/registration" className="lp__create-link">{cms("login_create_link", "Create an account")}</Link>
              </span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default Login;
