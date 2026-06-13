import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  const status = searchParams.get("status");
  const rawData = searchParams.get("data");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (rawData) {
      try {
        setReceipt(JSON.parse(decodeURIComponent(rawData)));
      } catch {}
    }
  }, [rawData]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const handleDownloadReceipt = () => {
    if (!receipt) return;

    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>COV Payment Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; color: #012a4a; background: #fff; padding: 40px; }
    .header { text-align: center; border-bottom: 2px solid #002b5b; padding-bottom: 20px; margin-bottom: 28px; }
    .header h1 { font-size: 24px; color: #002b5b; font-weight: 700; letter-spacing: 1px; }
    .header p { font-size: 13px; color: #6b8099; margin-top: 4px; }
    .receipt-title { text-align: center; font-size: 16px; font-weight: 600; color: #00a6a6; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }
    .status-badge { display: inline-block; background: #d1f7e8; color: #0f6e56; padding: 6px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    td { padding: 12px 16px; border-bottom: 1px solid #e8f4f8; font-size: 14px; }
    td:first-child { color: #6b8099; font-weight: 500; width: 45%; text-transform: uppercase; font-size: 12px; letter-spacing: 0.4px; }
    td:last-child { color: #012a4a; font-weight: 600; }
    .amount-row td:last-child { color: #002b5b; font-size: 18px; font-weight: 700; }
    .bank-section { background: #f2f9ff; border-radius: 10px; padding: 16px 20px; margin-bottom: 28px; }
    .bank-section h3 { font-size: 13px; color: #00a6a6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .bank-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }
    .bank-row span:first-child { color: #6b8099; }
    .bank-row span:last-child { color: #012a4a; font-weight: 500; }
    .footer { text-align: center; font-size: 12px; color: #6b8099; border-top: 1px solid #e8f4f8; padding-top: 16px; }
    .footer strong { color: #002b5b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Council of Valuers (COV)</h1>
    <p>House No. 3279, 2nd Floor, Street Number 14, New Ranjit Nagar, New Delhi - 110008</p>
    <p>covindiaforum@gmail.com | +91 9599099012</p>
  </div>

  <div class="receipt-title">Payment Receipt</div>
  <div style="text-align:center; margin-bottom: 20px;">
    <span class="status-badge">✓ Payment Successful</span>
  </div>

  <table>
    <tr><td>Receipt Date</td><td>${formatDate(receipt?.paidAt)}</td></tr>
    <tr><td>Transaction ID</td><td>${receipt?.trackingId || "—"}</td></tr>
    <tr><td>Order ID</td><td>${receipt?.orderId || "—"}</td></tr>
    <tr><td>Bank Reference No.</td><td>${receipt?.bankRefNo || "—"}</td></tr>
    <tr><td>Membership Number</td><td>${receipt?.membershipNo || "—"}</td></tr>
    <tr><td>Member Class</td><td>${receipt?.memberClass || "—"}</td></tr>
    <tr><td>Membership Type</td><td>${receipt?.memberType || "—"}</td></tr>
    <tr><td>Valid Till</td><td>${receipt?.validTill || "—"}</td></tr>
    <tr><td>Payment Mode</td><td>${receipt?.paymentMode || "—"}</td></tr>
    <tr class="amount-row"><td>Amount Paid</td><td>₹${receipt?.amount || "—"}</td></tr>
  </table>

  <div class="bank-section">
    <h3>Bank Details (COV)</h3>
    <div class="bank-row"><span>Bank Name</span><span>Yes Bank Ltd</span></div>
    <div class="bank-row"><span>Account Number</span><span>020588700000262</span></div>
    <div class="bank-row"><span>IFSC Code</span><span>YESB0000205</span></div>
    <div class="bank-row"><span>Branch</span><span>Karol Bagh, New Delhi</span></div>
  </div>

  <div class="footer">
    <p>This is a computer-generated receipt and does not require a signature.</p>
    <p style="margin-top:6px">Thank you for becoming a member of <strong>Council of Valuers (COV)</strong></p>
  </div>
</body>
</html>`;

    // Create a temporary element to hold the receipt HTML
    const element = document.createElement("div");
    element.innerHTML = receiptHTML;

    // Configuration for html2pdf
    const opt = {
      margin:       10,
      filename:     `COV-Receipt-${receipt?.orderId || "payment"}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use dynamic import for html2pdf to avoid issues if needed, 
    // but a standard import at the top is cleaner if it works.
    // Since I'm using Vite, I'll add the import at the top.
    import('html2pdf.js').then((html2pdf) => {
      html2pdf.default().from(element).set(opt).save();
    });
  };


  // ── SUCCESS PAGE ──
  if (status === "success" && receipt) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>

          {/* Success Icon */}
          <div style={styles.successCircle}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#00a6a6" opacity="0.12" />
              <circle cx="24" cy="24" r="18" fill="#00a6a6" />
              <path d="M14 24l7 7 13-14" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={styles.successTitle}>Payment Successful!</h1>
          <p style={styles.successSub}>Thank you for joining COV. Your membership is now active.</p>

          {/* Receipt Table */}
          <div style={styles.receiptBox}>
            <div style={styles.receiptHeader}>
              <span style={styles.receiptHeaderText}>Payment Receipt</span>
              <span style={styles.receiptBadge}>✓ Success</span>
            </div>

            <table style={styles.receiptTable}>
              <tbody>
                <ReceiptRow label="Transaction ID"     value={receipt.trackingId} />
                <ReceiptRow label="Order ID"           value={receipt.orderId} />
                <ReceiptRow label="Bank Ref No."       value={receipt.bankRefNo} />
                <ReceiptRow label="Membership No."     value={receipt.membershipNo} />
                <ReceiptRow label="Member Class"       value={receipt.memberClass} />
                <ReceiptRow label="Membership Type"    value={receipt.memberType} />
                <ReceiptRow label="Valid Till"       value={receipt.validTill} />
                <ReceiptRow label="Payment Mode"       value={receipt.paymentMode} />
                <ReceiptRow label="Date & Time"        value={formatDate(receipt.paidAt)} />
              </tbody>
            </table>

            {/* Amount */}
            <div style={styles.amountRow}>
              <span style={styles.amountLabel}>Amount Paid</span>
              <span style={styles.amountValue}>₹{receipt.amount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.btnRow}>
            <button style={styles.btnSecondary} onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </button>
            <button style={styles.btnPrimary} onClick={handleDownloadReceipt}>
              ⬇ Download Receipt
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── FAILED / ABORTED PAGE ──
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={{ ...styles.successCircle, background: "rgba(192,57,43,0.1)" }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="18" fill="#c0392b" />
            <path d="M16 16l16 16M32 16L16 32" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <h1 style={{ ...styles.successTitle, color: "#c0392b" }}>
          {status === "aborted" ? "Payment Cancelled" : "Payment Failed"}
        </h1>
        <p style={styles.successSub}>
          {status === "aborted"
            ? "You cancelled the payment. No amount was charged."
            : "Your payment could not be processed. Please try again."}
        </p>

        <div style={styles.btnRow}>
          <button style={styles.btnSecondary} onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          <button style={{ ...styles.btnPrimary, background: "#c0392b" }} onClick={() => navigate(-1)}>
            Try Again
          </button>
        </div>

      </div>
    </div>
  );
}

function ReceiptRow({ label, value }) {
  return (
    <tr>
      <td style={{ padding: "10px 16px", fontSize: 12, color: "#6b8099", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "0.5px solid #e8f4f8", width: "45%" }}>{label}</td>
      <td style={{ padding: "10px 16px", fontSize: 14, color: "#012a4a", fontWeight: 600, borderBottom: "0.5px solid #e8f4f8" }}>{value || "—"}</td>
    </tr>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f2f9ff", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "#fff", borderRadius: 16, border: "0.5px solid rgba(0,43,91,0.12)", padding: "40px 36px", maxWidth: 560, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,43,91,0.08)" },
  successCircle: { width: 80, height: 80, borderRadius: "50%", background: "rgba(0,166,166,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
  successTitle: { fontSize: 24, fontWeight: 700, color: "#002b5b", marginBottom: 8 },
  successSub: { fontSize: 14, color: "#6b8099", marginBottom: 28, lineHeight: 1.6 },
  receiptBox: { background: "#f8fbff", border: "1px solid rgba(0,43,91,0.1)", borderRadius: 12, marginBottom: 28, overflow: "hidden", textAlign: "left" },
  receiptHeader: { background: "#002b5b", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  receiptHeaderText: { color: "#fff", fontSize: 14, fontWeight: 600 },
  receiptBadge: { background: "#00a6a6", color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  receiptTable: { width: "100%", borderCollapse: "collapse" },
  amountRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#e8f4f8", borderTop: "1px solid rgba(0,43,91,0.1)" },
  amountLabel: { fontSize: 13, fontWeight: 600, color: "#002b5b", textTransform: "uppercase", letterSpacing: "0.5px" },
  amountValue: { fontSize: 22, fontWeight: 700, color: "#002b5b" },
  btnRow: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  btnPrimary: { background: "#00a6a6", color: "#fff", border: "none", padding: "11px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnSecondary: { background: "none", color: "#002b5b", border: "1px solid #002b5b", padding: "11px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
};

export default PaymentStatus;