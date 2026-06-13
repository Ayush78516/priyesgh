import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCMS } from "../hooks/useCMS";
import PayButton from "../components/PayButton";

export default function GuestDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cms = useCMS();
  const token = localStorage.getItem("userToken");

  const [activeTab, setActiveTab] = useState("events");
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract payForEvent from URL query params
  const searchParams = new URLSearchParams(location.search);
  const payForEventId = searchParams.get("payForEvent");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    // Mock fetching registered events and payments for guest
    // In reality, this would be an API call to /api/user/guest-events
    setTimeout(() => {
      setEvents(
        payForEventId
          ? [
              {
                id: payForEventId,
                title: cms("guest_event_title", "Valuation Masterclass 2024"),
                date: cms("guest_event_date", "15th August 2024"),
                fee: cms("guest_event_fee", "₹5000"),
                status: "Pending",
              },
            ]
          : []
      );
      setPayments([]);
      setLoading(false);
    }, 1000);
  }, [payForEventId, cms]);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "G";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email;
    return "Guest User";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Outfit, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#012a4a", color: "#fff", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 900, tracking: "tight" }}>COV <span style={{ color: "#00a6a6" }}>India</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.1)", padding: "6px 16px 6px 6px", borderRadius: 30 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00a6a6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              {getInitials()}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{getDisplayName()}</span>
          </div>
          <button onClick={() => logout()} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#012a4a", marginTop: 0, marginBottom: 8 }}>
            {cms("guest_dashboard_title", "Welcome to your Guest Dashboard")}
          </h1>
          <p style={{ color: "#64748b", fontSize: 16, marginTop: 0, marginBottom: 32 }}>
            {cms("guest_dashboard_subtitle", "Manage your event registrations and payments here.")}
          </p>

          <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
            {["events", "payments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "12px 24px",
                  fontSize: 16,
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab ? "3px solid #00a6a6" : "3px solid transparent",
                  color: activeTab === tab ? "#00a6a6" : "#64748b",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {tab === "events" ? "My Events" : "Payment History"}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading your data...</div>
          ) : activeTab === "events" ? (
            <div>
              {events.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, background: "#f8fafc", borderRadius: 12 }}>
                  <p style={{ color: "#64748b", fontSize: 16 }}>You haven't registered for any events yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {events.map((ev) => (
                    <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 24, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                      <div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{ev.title}</h3>
                        <div style={{ display: "flex", gap: 16, fontSize: 14, color: "#64748b" }}>
                          <span>📅 {ev.date}</span>
                          <span>💰 {ev.fee}</span>
                        </div>
                      </div>
                      <div>
                        {ev.status === "Pending" ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#eab308", background: "#fef9c3", padding: "4px 12px", borderRadius: 20 }}>Payment Pending</span>
                            <PayButton allSectionsValid={true} token={token} eventId={ev.id} />
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", background: "#dcfce7", padding: "6px 16px", borderRadius: 20 }}>Confirmed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {payments.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, background: "#f8fafc", borderRadius: 12 }}>
                  <p style={{ color: "#64748b", fontSize: 16 }}>No payment history available.</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#64748b", fontSize: 14, textAlign: "left" }}>
                      <th style={{ padding: "12px 16px" }}>Transaction ID</th>
                      <th style={{ padding: "12px 16px" }}>Date</th>
                      <th style={{ padding: "12px 16px" }}>Amount</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #e2e8f0", fontSize: 15, color: "#0f172a" }}>
                        <td style={{ padding: "16px" }}>{p.trackingId || p.orderId}</td>
                        <td style={{ padding: "16px" }}>{new Date(p.paidAt).toLocaleDateString()}</td>
                        <td style={{ padding: "16px", fontWeight: 600 }}>₹{p.amount}</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 20, 
                            color: p.status === "Success" ? "#22c55e" : "#ef4444", 
                            background: p.status === "Success" ? "#dcfce7" : "#fee2e2" }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
