import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || "Invalid credentials"); return; }

            if (data.role !== "admin" && data.role !== "super-admin") {
                setError("Access denied. Admin credentials required.");
                return;
            }

            login(data.token, data.refreshToken, {
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                email: form.email,
                tempMembershipId: data.tempMembershipId,
            }, true);
            navigate("/admin-dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.root}>
            <style>{globalStyles}</style>

            {/* Background grid */}
            <div style={s.bgGrid} />

            {/* Glow orbs */}
            <div style={s.glowOrb1} />
            <div style={s.glowOrb2} />

            <div style={s.card}>

                {/* Logo area */}
                <div style={s.logoWrap}>
                    <div style={s.logoBox}>
                        <span style={s.logoText}>COV</span>
                    </div>
                    <div style={s.logoSub}>Admin Portal</div>
                </div>

                <h1 style={s.title}>Welcome back</h1>
                <p style={s.subtitle}>Sign in to access the admin dashboard</p>

                {error && (
                    <div style={s.errorBox}>
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={s.form}>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Email Address</label>
                        <div style={s.inputWrap}>
                            <span style={s.inputIcon}>✉</span>
                            <input
                                type="email"
                                style={s.input}
                                placeholder="admin@covindia.com"
                                value={form.email}
                                onChange={e => { setForm({ ...form, email: e.target.value }); setError(""); }}
                                required
                            />
                        </div>
                    </div>

                    <div style={s.fieldGroup}>
                        <label style={s.label}>Password</label>
                        <div style={s.inputWrap}>
                            <span style={s.inputIcon}>🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                style={{ ...s.input, paddingRight: 44 }}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => { setForm({ ...form, password: e.target.value }); setError(""); }}
                                required
                            />
                            <button type="button" style={s.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>

                    <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.8 : 1 }} disabled={loading}>
                        {loading ? (
                            <span style={s.loadingSpinner}>Authenticating...</span>
                        ) : (
                            "Sign In to Admin Panel"
                        )}
                    </button>
                </form>

                <div style={s.footer}>
                    <a href="/login" style={s.backLink}>← Back to Member Login</a>
                </div>

                <div style={s.securityNote}>
                    🔐 Secured admin access
                </div>

            </div>
        </div>
    );
}

const s = {
    root: {
        minHeight: "100vh",
        background: "#050b14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
    },
    bgGrid: {
        position: "fixed",
        inset: 0,
        backgroundImage: `linear-gradient(rgba(0,166,166,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,166,166,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
    },
    glowOrb1: {
        position: "fixed",
        top: "-20%",
        right: "-10%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,43,91,0.4) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    glowOrb2: {
        position: "fixed",
        bottom: "-20%",
        left: "-10%",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,166,166,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    card: {
        position: "relative",
        zIndex: 1,
        background: "#0d1424",
        border: "1px solid #1e293b",
        borderRadius: 20,
        padding: "44px 40px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
    },
    logoWrap: { textAlign: "center", marginBottom: 32 },
    logoBox: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 72,
        height: 72,
        borderRadius: 18,
        background: "linear-gradient(135deg, #0080ff, #00a6a6)",
        border: "1px solid rgba(255,255,255,0.2)",
        marginBottom: 12,
        boxShadow: "0 8px 24px rgba(0,166,166,0.3)",
    },
    logoText: { fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-1px" },
    logoSub: { fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "2px" },
    title: { fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 8px", textAlign: "center", letterSpacing: "-0.5px" },
    subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 32, opacity: 0.8 },
    errorBox: {
        background: "rgba(239,68,68,0.15)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 12,
        padding: "14px 18px",
        fontSize: 13,
        color: "#fca5a5",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    form: { display: "flex", flexDirection: "column", gap: 20 },
    fieldGroup: { display: "flex", flexDirection: "column", gap: 10 },
    label: { fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "1px" },
    inputWrap: { position: "relative", display: "flex", alignItems: "center" },
    inputIcon: { position: "absolute", left: 16, fontSize: 14, color: "#475569", pointerEvents: "none", zIndex: 1 },
    input: {
        width: "100%",
        padding: "14px 16px 14px 44px",
        background: "rgba(17,24,39,0.7)",
        border: "1px solid #1e293b",
        borderRadius: 14,
        color: "#f8fafc",
        fontSize: 14,
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
        transition: "all 0.25s ease",
    },
    eyeBtn: {
        position: "absolute",
        right: 14,
        background: "none",
        border: "none",
        color: "#475569",
        cursor: "pointer",
        fontSize: 16,
        padding: 4,
        transition: "color 0.2s",
    },
    submitBtn: {
        background: "linear-gradient(135deg, #002b5b 0%, #0080ff 100%)",
        color: "#fff",
        border: "none",
        padding: "16px 24px",
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 800,
        cursor: "pointer",
        width: "100%",
        marginTop: 8,
        letterSpacing: "0.5px",
        boxShadow: "0 12px 32px rgba(0,43,91,0.4)",
        transition: "transform 0.2s, box-shadow 0.2s",
    },
    loadingSpinner: { opacity: 0.8 },
    footer: { textAlign: "center", marginTop: 28 },
    backLink: { fontSize: 13, color: "#475569", textDecoration: "none", fontWeight: 600, transition: "color 0.2s" },
    securityNote: {
        textAlign: "center",
        fontSize: 11,
        color: "#334155",
        marginTop: 24,
        fontWeight: 700,
        opacity: 0.6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  input:focus { border-color: #00a6a6 !important; box-shadow: 0 0 0 3px rgba(0,166,166,0.1); }
  input::placeholder { color: #334155; }
`;
