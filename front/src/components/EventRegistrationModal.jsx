import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, UserPlus, Phone, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function EventRegistrationModal({ isOpen, onClose, event }) {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  
  // view can be: 'selection' | 'auth_action' | 'login' | 'register' | 'event_form' | 'success'
  // If the user is already authenticated, start directly at 'event_form'
  const [view, setView] = useState(isAuthenticated ? "event_form" : "selection");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendeeType, setAttendeeType] = useState(""); // 'member' or 'guest'
  const [hasPaidMembership, setHasPaidMembership] = useState(true); // Default to true until checked

  // Fetch membership payment status when modal opens for authenticated users
  React.useEffect(() => {
    if (isOpen && isAuthenticated) {
      const token = localStorage.getItem("userToken");
      if (token) {
        setLoading(true);
        fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data && data.data.payments) {
              const hasPaid = data.data.payments.some(p => p && (p.status === "Success" || p.status === "Completed"));
              setHasPaidMembership(hasPaid);
              if (!hasPaid) setView("unpaid_alert");
              else setView("event_form");
            }
          })
          .catch(err => console.error("Error fetching profile for membership check", err))
          .finally(() => setLoading(false));
      }
    }
  }, [isOpen, isAuthenticated]);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [eventData, setEventData] = useState({ notes: "", specialDiet: "None" });
  const [otp, setOtp] = useState("");
  if (!isOpen) return null;

  // Handle resetting state when closing
  const handleClose = () => {
    if (isAuthenticated) {
      setView(hasPaidMembership ? "event_form" : "unpaid_alert");
    } else {
      setView("selection");
    }
    setAttendeeType("");
    setError("");
    onClose();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      login(data.token, data.refreshToken, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        email: loginData.email,
        tempMembershipId: data.tempMembershipId
      }, false);
      setView("event_form");
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerData.email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      if (data.devOtp) {
        setError(`SMTP unavailable locally. Use OTP: ${data.devOtp}`);
      }
      setView("verify_otp");
    } catch (err) {
      setError("An error occurred while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

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
        body: JSON.stringify({ email: registerData.email.toLowerCase().trim(), otp }),
      });
      const verifyData = await verifyRes.json();
      
      if (verifyRes.ok || verifyData.message === "Email verified successfully") {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...registerData,
            email: registerData.email.toLowerCase().trim(),
          }),
        });
        const regData = await regRes.json();
        if (!regRes.ok) {
          setError(regData.message || "Registration failed");
          return;
        }
        login(regData.token, regData.refreshToken, {
          firstName: regData.firstName,
          lastName: regData.lastName,
          email: regData.email,
          phone: regData.phone,
        });
        localStorage.setItem("pendingMemberClass", "Non-Member");
        setView("event_form");
      } else {
        setError(verifyData.message || "Invalid or expired OTP.");
      }
    } catch (err) {
      setError("An error occurred during verification/registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerData.email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to resend OTP.");
      } else {
        if (data.devOtp) {
          setError(`SMTP unavailable locally. Use OTP: ${data.devOtp}`);
        } else {
          alert("OTP resent to your email.");
        }
      }
    } catch (err) {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Determine the dashboard path based on role/auth
    // If not authenticated, or if they chose "guest" attendeeType, it's guest dashboard
    const dashboardPath = (isAuthenticated && attendeeType !== "guest") ? "/dashboard" : "/guest-dashboard";
    
    // Mocking an event registration API call
    setTimeout(() => {
      setLoading(false);
      onClose();
      // Redirect to appropriate dashboard with event info to trigger payment
      navigate(`${dashboardPath}?payForEvent=${event?.id || 123}`);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-[#002b5b]/80 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-solid border-slate-100 bg-[#f8fbff]">
            <div>
              <h3 className="text-xl font-black text-[#012a4a] m-0">Event Registration</h3>
              <p className="text-xs font-bold text-[#00a6a6] mt-1 m-0 truncate max-w-[250px]">{event?.title}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors border-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl border border-rose-200 text-center">
                {error}
              </div>
            )}

            {/* VIEW: SELECTION */}
            {view === "selection" && (
              <div className="space-y-4">
                <p className="text-center text-slate-600 font-medium mb-6 mt-0">
                  Welcome! Please tell us your membership status to proceed with the registration.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/login");
                  }}
                  className="w-full bg-white hover:bg-[#f2f9ff] border-2 border-solid border-[#00a6a6] text-[#00a6a6] py-4 px-6 rounded-2xl font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    I am a COV Member
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setAttendeeType("guest");
                    setView("auth_action");
                  }}
                  className="w-full bg-white hover:bg-slate-50 border-2 border-solid border-slate-200 text-slate-700 py-4 px-6 rounded-2xl font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    I am a Non-Member
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* VIEW: AUTH_ACTION (Login or Register) */}
            {view === "auth_action" && (
              <div className="space-y-4">
                <p className="text-center text-slate-600 font-medium mb-6 mt-0">
                  Do you already have an account with us?
                </p>
                <button
                  onClick={() => setView("login")}
                  className="w-full bg-[#002b5b] hover:bg-[#001f44] text-white py-4 px-6 rounded-2xl font-bold tracking-wide shadow-md transition-all duration-300 border-none cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Yes, Login to my Account
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("register")}
                  className="w-full bg-white hover:bg-slate-50 border-2 border-solid border-slate-200 text-slate-700 py-4 px-6 rounded-2xl font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    No, Create a New Account
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center mt-6">
                  <button type="button" onClick={() => setView("selection")} className="bg-transparent border-none text-xs font-bold text-[#00a6a6] cursor-pointer hover:underline">
                    ← Back to Membership Status
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: UNPAID ALERT */}
            {view === "unpaid_alert" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="bg-amber-50 border border-solid border-amber-200 p-5 rounded-2xl mb-6">
                  <h4 className="text-amber-800 font-bold m-0 mb-2 flex items-center gap-2">
                    <span className="text-xl">⚠️</span> Membership Fee Pending
                  </h4>
                  <p className="text-amber-700 text-sm m-0 leading-relaxed font-medium">
                    It looks like your COV membership fee is pending. Please pay your membership fee first to register as a Member, or you can choose to join this event as a Non-Member.
                  </p>
                </div>

                <div className="space-y-3 mt-auto">
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/dashboard");
                    }}
                    className="w-full bg-[#00a6a6] hover:bg-[#008c8c] text-white py-3.5 px-6 rounded-xl font-bold tracking-wide shadow-md transition-colors border-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    Pay Membership Fee
                  </button>
                  <button
                    onClick={() => {
                      setAttendeeType("guest");
                      setView("event_form");
                    }}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-solid border-slate-200 py-3.5 px-6 rounded-xl font-bold tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    Join Event as Non-Member
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW: LOGIN */}
            {view === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <p className="text-center text-slate-600 font-medium mb-6 mt-0">
                  Log in to your COV account to continue.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-solid border-slate-200 rounded-xl focus:border-[#00a6a6] focus:bg-white focus:outline-none transition-colors text-sm font-medium"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Enter your registered email"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-solid border-slate-200 rounded-xl focus:border-[#00a6a6] focus:bg-white focus:outline-none transition-colors text-sm font-medium"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-[#002b5b] hover:bg-[#001f44] text-white py-3.5 px-6 rounded-xl font-bold tracking-wide shadow-md transition-all duration-300 border-none cursor-pointer"
                >
                  {loading ? "Authenticating..." : "Login & Continue"}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setView(attendeeType === "member" ? "selection" : "auth_action")} className="bg-transparent border-none text-xs font-bold text-[#00a6a6] cursor-pointer hover:underline">
                    ← Back
                  </button>
                </div>
              </form>
            )}

            {/* VIEW: REGISTER */}
            {view === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <p className="text-center text-slate-600 font-medium mb-6 mt-0">
                  Create a free account to register for this event.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                    <input
                      type="text"
                      required
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-solid border-slate-200 rounded-xl focus:border-[#00a6a6] focus:bg-white focus:outline-none transition-colors text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                    <input
                      type="text"
                      required
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-solid border-slate-200 rounded-xl focus:border-[#00a6a6] focus:bg-white focus:outline-none transition-colors text-sm font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-solid border-slate-200 rounded-xl focus:border-[#00a6a6] focus:bg-white focus:outline-none transition-colors text-sm font-medium"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-solid border-slate-200 rounded-xl focus:border-[#00a6a6] focus:bg-white focus:outline-none transition-colors text-sm font-medium"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Create Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-solid border-slate-200 rounded-xl focus:border-[#00a6a6] focus:bg-white focus:outline-none transition-colors text-sm font-medium"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-[#002b5b] hover:bg-[#001f44] text-white py-3.5 px-6 rounded-xl font-bold tracking-wide shadow-md transition-all duration-300 border-none cursor-pointer"
                >
                  {loading ? "Sending OTP..." : "Send OTP & Continue"}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setView("auth_action")} className="bg-transparent border-none text-xs font-bold text-[#00a6a6] cursor-pointer hover:underline">
                    ← Back
                  </button>
                </div>
              </form>
            )}

            {/* VIEW: VERIFY OTP */}
            {view === "verify_otp" && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                <p className="text-center text-slate-600 font-medium mb-6 mt-0">
                  We sent a 6-digit OTP to <strong>{registerData.email}</strong>.<br />
                  Please verify your email to complete registration.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Enter OTP</label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError(""); }}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-solid border-slate-200 rounded-xl focus:border-[#00a6a6] focus:bg-white focus:outline-none transition-colors text-xl font-bold tracking-widest text-center"
                    placeholder="------"
                  />
                </div>
                
                <div className="text-center mt-2">
                  <p className="text-xs text-slate-500 mb-2">OTP is valid for 10 minutes.</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="bg-transparent border-none text-xs font-bold text-[#00a6a6] cursor-pointer hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-[#002b5b] hover:bg-[#001f44] text-white py-3.5 px-6 rounded-xl font-bold tracking-wide shadow-md transition-all duration-300 border-none cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => { setView("register"); setOtp(""); }} className="bg-transparent border-none text-xs font-bold text-[#00a6a6] cursor-pointer hover:underline">
                    ← Back to Registration
                  </button>
                </div>
              </form>
            )}

            {/* VIEW: EVENT REGISTRATION FORM */}
            {view === "event_form" && (
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="bg-[#f2f9ff] border border-solid border-[#e8f4f8] p-4 rounded-2xl mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00a6a6] rounded-full flex items-center justify-center text-white shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[#012a4a] font-bold m-0">{user?.firstName} {user?.lastName}</h4>
                    <p className="text-slate-500 text-xs m-0 font-medium">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#e8f4f8] text-[#00a6a6] text-[10px] font-bold rounded-full uppercase tracking-wider border border-solid border-[#00a6a6]/20">
                      {user?.role || "Non-Member"}
                    </span>
                  </div>
                </div>



                {event?.paymentRequired && (
                  <div className="bg-amber-50 border border-solid border-amber-200 p-4 rounded-xl text-amber-800 text-xs font-medium mt-2">
                    Note: This is a paid event. By proceeding, you will be redirected to the payment gateway or an invoice will be generated based on your membership.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-[#00a6a6] hover:bg-[#008c8c] text-white py-3.5 px-6 rounded-xl font-bold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : "Confirm Event Booking"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* VIEW: SUCCESS */}
            {view === "success" && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-[#012a4a] m-0 mb-2">Registration Confirmed!</h2>
                <p className="text-slate-600 font-medium mb-6 mt-0">
                  You are successfully registered for <strong>{event?.title}</strong>. 
                  A confirmation email has been sent to your registered email address.
                </p>
                <button
                  onClick={handleClose}
                  className="bg-[#002b5b] hover:bg-[#001f44] text-white py-3 px-8 rounded-full font-bold tracking-wide shadow-md transition-all duration-300 border-none cursor-pointer"
                >
                  Close & Return to Event
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
