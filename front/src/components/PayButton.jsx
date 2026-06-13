import { useState } from "react";

// CCAvenue Payment Button
// Flow:
// 1. Calls /api/payment/initiate-data to get order data
// 2. Creates a hidden form and POSTs to ccavServer (port 3001) /ccavRequestHandler
// 3. ccavServer encrypts data and auto-submits to CCAvenue
// 4. CCAvenue redirects back to ccavServer /ccavResponseHandler
// 5. ccavServer saves payment and redirects to /payment-status

function PayButton({ allSectionsValid, token, eventId = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!allSectionsValid) return;
    setLoading(true);
    setError("");

    try {
      // Step 1 — Get order data from our backend
      const queryParams = eventId ? `?paymentType=event&eventId=${eventId}` : "";
      const res = await fetch(`/api/payment/initiate-data${queryParams}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to initiate payment");

      console.log("Payment data received:", data);

      // Step 2 — POST to /ccavRequestHandler via Vite proxy (same origin → port 3001)
      // Using a relative path avoids the cross-origin "Unsafe attempt to load URL" error.
      // Vite proxies /ccavRequestHandler → http://localhost:3001/ccavRequestHandler
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/ccavRequestHandler"; // proxied by Vite to localhost:3001

      // Add all form fields
      Object.entries(data.formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value || "";
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.error("Payment error:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      {error && (
        <div style={{
          color: "#c0392b", fontSize: 13, padding: "8px 14px",
          background: "#fde8e8", borderRadius: 6, border: "1px solid #f5c6cb"
        }}>
          ❌ {error}
        </div>
      )}

      <button
        disabled={!allSectionsValid || loading}
        onClick={handlePay}
        style={{
          background: allSectionsValid ? "#00a6a6" : "#ccc",
          color: "#fff",
          border: "none",
          padding: "13px 36px",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: allSectionsValid ? "pointer" : "not-allowed",
          opacity: loading ? 0.8 : 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "all 0.2s",
        }}
      >
        {loading ? (
          <>⏳ Redirecting to payment...</>
        ) : (
          <>🔒 Proceed to Payment</>
        )}
      </button>

      {allSectionsValid && !loading && (
        <p style={{ fontSize: 12, color: "#6b8099", margin: 0 }}>
          Secured by CCAvenue · AES-128 Encrypted
        </p>
      )}
    </div>
  );
}

export default PayButton;