import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCMS } from "../hooks/useCMS";
import {
  DEFAULT_MEMBERSHIP_FEES,
  MEMBERSHIP_FEES_CMS_KEY,
  parseMembershipFees,
  resolveMembershipFeePreview,
} from "../data/membershipFees";

const MEMBER_CLASS_OPTIONS = [
  { value: "Student", label: "Student Member" },
  { value: "Affiliate", label: "Affiliate Member" },
  { value: "Chartered", label: "Chartered Member" },
  { value: "Fellow", label: "Fellow Member" },
  { value: "Non-Member", label: "Non-Member" },
  { value: "Institutional", label: "Institutional Member" },
];

const MEMBER_CLASS_ALIASES = {
  student: "Student",
  affiliate: "Affiliate",
  chartered: "Chartered",
  fellow: "Fellow",
  guest: "Non-Member",
  "non-member": "Non-Member",
  institutional: "Institutional",
};

function normalizeMemberClass(value = "") {
  const key = value.toString().trim().toLowerCase();
  return MEMBER_CLASS_ALIASES[key] || "Student";
}

function Registration() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const cms = useCMS();
  const [searchParams] = useSearchParams();
  const initialMemberClass = normalizeMemberClass(searchParams.get("memberClass") || localStorage.getItem("pendingMemberClass") || "Student");

  const [step, setStep] = useState(1); // 1 = form, 2 = otp, 3 = done
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirmPassword: "", terms: false,
  });
  const [memberClass, setMemberClass] = useState(initialMemberClass);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [membershipFees, setMembershipFees] = useState(DEFAULT_MEMBERSHIP_FEES);
  const [gstTaxes, setGstTaxes] = useState([]);

  useEffect(() => {
    const loadFeeData = async () => {
      try {
        const [cmsRes, gstRes] = await Promise.all([
          fetch("/api/public/cms"),
          fetch("/api/public/gst/tax"),
        ]);

        const cmsData = await cmsRes.json().catch(() => null);
        const gstData = await gstRes.json().catch(() => null);

        if (cmsData?.success && Array.isArray(cmsData.data)) {
          const feeRecord = cmsData.data.find((item) => item.key === MEMBERSHIP_FEES_CMS_KEY);
          const parsed = parseMembershipFees(feeRecord?.value);
          setMembershipFees(parsed.length > 0 ? parsed : DEFAULT_MEMBERSHIP_FEES);
        }

        if (gstData?.success && Array.isArray(gstData.data)) {
          setGstTaxes(gstData.data);
        }
      } catch {
        // Keep defaults if the public fetch fails.
      }
    };

    loadFeeData();
  }, []);

  useEffect(() => {
    localStorage.setItem("pendingMemberClass", memberClass);
  }, [memberClass]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setError("");
  };

  const feePreview = useMemo(() => {
    return resolveMembershipFeePreview({
      rows: membershipFees,
      memberClass,
      gstTaxes,
    });
  }, [membershipFees, memberClass, gstTaxes]);

  // STEP 1 — validate form and send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.terms) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      if (data.devOtp) {
        setError(`SMTP unavailable locally. Use OTP: ${data.devOtp}`);
      }
      setOtpSent(true);
      setStep(2);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to resend OTP.");
        return;
      }
      if (data.devOtp) {
        setError(`SMTP unavailable locally. Use OTP: ${data.devOtp}`);
      } else {
        setError("");
        alert("OTP resent to your email.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — verify OTP then register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {


      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.toLowerCase().trim(), otp }),
      });
      const verifyData = await verifyRes.json();
      
      // If already verified or just verified, proceed to register
      if (verifyRes.ok || verifyData.message === "Email verified successfully") {
          const regRes = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email.toLowerCase().trim(),
              phone: formData.phone,
              password: formData.password,
            }),
          });
          const regData = await regRes.json();
          if (!regRes.ok) {
            setError(regData.message || "Registration failed. Please try again.");
            return;
          }

          login(regData.token, regData.refreshToken, {
            firstName: regData.firstName,
            lastName: regData.lastName,
            email: regData.email,
            phone: regData.phone,
          });
          localStorage.setItem("pendingMemberClass", memberClass);
          localStorage.setItem("pendingMembershipFee", String(feePreview.amount || 0));
          
          setStep(3);
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
      } else {
        setError(verifyData.message || "Invalid or expired OTP.");
        return;
      }

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="container">

        {/* Left Section */}
        <div className="left-section">
          <img
            className="image-placeholder"
            src={cms("reg_left_image", "/assets/soon.jpg")}
            alt="COV Advertisement"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Right Section */}
        <div className="right-section">

          {/* ── STEP 1: REGISTRATION FORM ── */}
          {step === 1 && (
            <>
              <div className="form-header">
                <h1>{cms("reg_title", "Create Account")}</h1>
                <p>{cms("reg_subtitle", "Join us today and start your learning journey")}</p>
              </div>

              {error && (
                <p style={{ color: "red", marginBottom: 15, fontSize: 14 }}>{error}</p>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="memberClass">Membership Category *</label>
                  <select
                    id="memberClass"
                    name="memberClass"
                    value={memberClass}
                    onChange={(e) => setMemberClass(e.target.value)}
                    required
                  >
                    {MEMBER_CLASS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{
                  marginBottom: 18,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#f8fbff",
                  border: "1px solid #d7e7f5",
                  color: "#12304a",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#4b6b88", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Fee Preview
                  </div>
                  {feePreview.feeRow ? (
                    <>
                      <div style={{ fontSize: 16, fontWeight: 800, marginTop: 6 }}>
                        {feePreview.feeRow.category}
                      </div>
                      <div style={{ fontSize: 13, marginTop: 6 }}>
                        Base fee: ₹{Number(feePreview.baseAmount || 0).toLocaleString("en-IN")}
                        {" "}· GST: {feePreview.hasGst ? `${feePreview.gstRate}%${feePreview.gstName ? ` (${feePreview.gstName})` : ""}` : "No GST"}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8, color: "#002b5b" }}>
                        Amount payable: ₹{Number(feePreview.amount || 0).toLocaleString("en-IN")}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                      No fee is configured for this category. Please contact the admin team.
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text" id="firstName" name="firstName"
                      placeholder={cms("reg_fname_ph", "First name")}
                      value={formData.firstName} onChange={handleChange} required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text" id="lastName" name="lastName"
                      placeholder={cms("reg_lname_ph", "Last name")}
                      value={formData.lastName} onChange={handleChange} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email" id="email" name="email"
                    placeholder={cms("reg_email_ph", "Enter your email address")}
                    value={formData.email} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel" id="phone" name="phone"
                    placeholder={cms("reg_phone_ph", "Enter your mobile number")}
                    value={formData.phone} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password" id="password" name="password"
                    placeholder={cms("reg_pass_ph", "Create a password")}
                    value={formData.password} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password" id="confirmPassword" name="confirmPassword"
                    placeholder={cms("reg_pass_ph", "Confirm your password")}
                    value={formData.confirmPassword} onChange={handleChange} required
                  />
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox" id="terms" name="terms"
                    checked={formData.terms} onChange={handleChange} required
                  />
                  <label htmlFor="terms">
                    I agree to the{" "}
                    <Link to="/terms">Terms &amp; Conditions</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>
                  </label>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Sending OTP..." : cms("reg_submit_btn", "Sign Up")}
                </button>

                <div className="divider"><span>OR</span></div>

                <div className="social-login">
                  <button type="button" className="social-btn">Google</button>
                  <button type="button" className="social-btn">Facebook</button>
                </div>

                <div className="login-link">
                  Already have an account? <Link to="/login">Log In</Link>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP VERIFICATION ── */}
          {step === 2 && (
            <>
              <div className="form-header">
                <h1>Verify Email</h1>
                <p>
                  We sent a 6-digit OTP to <strong>{formData.email}</strong>.
                  <br />Check your inbox (and spam folder).
                </p>
              </div>

              {error && (
                <p style={{ color: "red", marginBottom: 15, fontSize: 14 }}>{error}</p>
              )}

              <form onSubmit={handleVerifyAndRegister}>
                <div className="form-group">
                  <label htmlFor="otp">Enter OTP *</label>
                  <input
                    type="text" id="otp" name="otp"
                    placeholder={cms("reg_otp_ph", "Enter 6-digit OTP")}
                    value={otp}
                    onChange={e => { setOtp(e.target.value); setError(""); }}
                    maxLength={6}
                    required
                    style={{ letterSpacing: 6, fontSize: 20, textAlign: "center" }}
                  />
                </div>

                <p style={{ fontSize: 13, color: "#6b8099", marginBottom: 16 }}>
                  OTP is valid for 10 minutes.{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    style={{ background: "none", border: "none", color: "#00a6a6", cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}
                  >
                    Resend OTP
                  </button>
                </p>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); setOtp(""); }}
                  style={{ background: "none", border: "none", color: "#6b8099", cursor: "pointer", fontSize: 13, marginTop: 12, display: "block", width: "100%", textAlign: "center" }}
                >
                  ← Back to form
                </button>
              </form>
            </>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
              <h1 style={{ color: "#002b5b", marginBottom: 10 }}>Account Created!</h1>
              <p style={{ color: "#6b8099", marginBottom: 20 }}>
                Welcome to COV. Redirecting to your dashboard...
              </p>
              <div style={{ width: 40, height: 4, background: "#00a6a6", borderRadius: 2, margin: "0 auto", animation: "grow 2s linear forwards" }} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Registration;
