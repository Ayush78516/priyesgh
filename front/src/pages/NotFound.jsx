import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function NotFound() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    // Auto-redirect to home after 10 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #002b5b 0%, #00a6a6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Segoe UI', sans-serif",
            padding: "20px",
            marginTop: "100px",
        }}>
            <div style={{
                background: "#fff",
                borderRadius: 24,
                padding: "60px 48px",
                textAlign: "center",
                maxWidth: 560,
                width: "100%",
                boxShadow: "0 24px 80px rgba(0,43,91,0.25)",
            }}>
                {/* 404 Number */}
                <div style={{
                    fontSize: "clamp(80px, 15vw, 120px)",
                    fontWeight: 900,
                    lineHeight: 1,
                    background: "linear-gradient(135deg, #002b5b, #00a6a6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-4px",
                    marginBottom: 8,
                }}>
                    404
                </div>

                {/* COV Logo text */}
                <div style={{ fontSize: 16, fontWeight: 700, color: "#00a6a6", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
                    COV India
                </div>

                {/* Heading */}
                <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, color: "#002b5b", marginBottom: 12 }}>
                    Page Not Found
                </h1>

                {/* Description */}
                <p style={{ fontSize: 15, color: "#6b8099", lineHeight: 1.7, marginBottom: 32 }}>
                    The page you're looking for doesn't exist or may have been moved.
                    You'll be automatically redirected to the home page in{" "}
                    <strong style={{ color: "#002b5b" }}>{countdown}</strong> second{countdown !== 1 ? "s" : ""}.
                </p>

                {/* Progress bar */}
                <div style={{ background: "#f2f9ff", borderRadius: 50, height: 6, marginBottom: 36, overflow: "hidden" }}>
                    <div style={{
                        height: "100%",
                        width: `${(countdown / 10) * 100}%`,
                        background: "linear-gradient(90deg, #002b5b, #00a6a6)",
                        borderRadius: 50,
                        transition: "width 1s linear",
                    }} />
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link to="/" style={{
                        background: "linear-gradient(135deg, #002b5b, #004080)",
                        color: "#fff",
                        padding: "12px 28px",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                    }}>
                        🏠 Go to Home
                    </Link>
                    <button onClick={() => navigate(-1)} style={{
                        background: "none",
                        border: "2px solid #002b5b",
                        color: "#002b5b",
                        padding: "12px 28px",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                    }}>
                        ← Go Back
                    </button>
                    <Link to="/contact" style={{
                        background: "rgba(0,166,166,0.1)",
                        border: "2px solid #00a6a6",
                        color: "#00a6a6",
                        padding: "12px 28px",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                    }}>
                        📞 Contact Us
                    </Link>
                </div>

                {/* Quick links */}
                <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid #e8f4f8" }}>
                    <p style={{ fontSize: 13, color: "#6b8099", marginBottom: 14 }}>Quick Links</p>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                        {[
                            { to: "/membership", label: "Membership" },
                            { to: "/about-us", label: "About Us" },
                            { to: "/bod", label: "Board of Directors" },
                            { to: "/contact", label: "Contact" },
                        ].map(link => (
                            <Link key={link.to} to={link.to} style={{
                                fontSize: 13, color: "#002b5b", textDecoration: "none", fontWeight: 600,
                                padding: "4px 12px", borderRadius: 6, background: "#f2f9ff",
                                border: "1px solid rgba(0,43,91,0.1)",
                            }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;