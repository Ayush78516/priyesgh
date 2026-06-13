function Refund() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>Refund &amp; Cancellation Policy</h1>
        <p className="last-updated">Last Updated: January 19, 2026</p>
      </section>

      {/* MAIN CONTENT */}
      <div className="refund-container">
        <div className="refund-content">
          <p className="intro-text">
            This Refund &amp; Cancellation Policy outlines the rules and
            procedures regarding payments made to Confederation of Valuers (COV)
            for services, memberships, and training programs. Please read this
            policy carefully before making any payment.
          </p>

          {/* Section 1 */}
          <div className="refund-section">
            <h2><span className="section-number">1</span> No Automatic Refunds</h2>
            <div className="warning-box">
              <p>
                <strong>Important:</strong> All payments made for services,
                consultations, memberships, training programs, or packages are
                non-refundable by default, except under specific conditions
                mentioned below.
              </p>
            </div>
            <p>
              By completing a payment, you acknowledge and agree to this policy.
              Please ensure you have reviewed all service details before making
              a purchase.
            </p>
          </div>

          {/* Section 2 */}
          <div className="refund-section">
            <h2><span className="section-number">2</span> Eligible Refund Cases</h2>
            <p>Refunds may be considered and approved only in the following circumstances:</p>
            <ul className="eligible-list">
              <li>Payment has been deducted from your account, but the service or access has not been initiated by COV</li>
              <li>A duplicate payment has been made for the same service or transaction</li>
              <li>A technical error from our end prevents service delivery or platform access</li>
              <li>COV cancels or fails to deliver the service due to unforeseen circumstances</li>
            </ul>
            <p>
              To request a refund under these conditions, you must provide proof
              of payment and contact us within 7 days of the transaction.
            </p>
          </div>

          {/* Section 3 */}
          <div className="refund-section">
            <h2><span className="section-number">3</span> Non-Refundable Cases</h2>
            <p>Refunds will <strong>NOT</strong> be provided in the following situations:</p>
            <ul className="non-refundable-list">
              <li>The service has already started, been delivered, or access has been granted</li>
              <li>Delay or cancellation occurs due to incomplete or incorrect information provided by you</li>
              <li>You change your mind or decide not to proceed after completing the payment</li>
              <li>Missed appointments, sessions, or events without prior notice (at least 24 hours in advance)</li>
              <li>Failure to attend training programs or webinars after registration</li>
              <li>Dissatisfaction with the service after it has been delivered</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="refund-section">
            <h2><span className="section-number">4</span> Cancellation Policy</h2>
            <div className="info-box">
              <p><strong>Cancellation Window:</strong> Cancellations must be requested at least 24 hours before the scheduled service, appointment, or event.</p>
              <p><strong>Late Cancellations:</strong> Requests made after this 24-hour period will not be eligible for refunds or rescheduling.</p>
            </div>
            <p>
              To cancel a service, please contact us via email with your booking
              details and transaction ID. We will review your request and confirm
              eligibility within 2-3 business days.
            </p>
          </div>

          {/* Section 5 */}
          <div className="refund-section">
            <h2><span className="section-number">5</span> Refund Processing Time</h2>
            <p>If your refund request is approved:</p>
            <ul className="eligible-list">
              <li>Refunds will be processed within <strong>7–10 working days</strong> from the date of approval</li>
              <li>The refund amount will be credited to your original payment method (bank account, card, UPI, etc.)</li>
              <li>Processing time may vary depending on your bank or payment provider</li>
              <li>You will receive a confirmation email once the refund has been initiated</li>
            </ul>
            <p>
              Please note that COV is not responsible for delays caused by
              third-party payment gateways or banks.
            </p>
          </div>

          {/* Section 6 */}
          <div className="refund-section">
            <h2><span className="section-number">6</span> How to Request a Refund</h2>
            <p>To request a refund, please email us with the following details:</p>
            <ul className="eligible-list">
              <li>Full name and registered email address</li>
              <li>Transaction ID or payment receipt</li>
              <li>Date of payment and service details</li>
              <li>Reason for refund request with supporting evidence (if applicable)</li>
            </ul>
            <div className="contact-box">
              <h3>Contact Us for Refunds</h3>
              <p>📧 Email: <a href="mailto:covindiaforum@gmail.com">covindiaforum@gmail.com</a></p>
              <p>📞 Phone: <a href="tel:+919599099012">+91 9599099012</a></p>
              <p>📍 Address: 2nd Floor, House No. 3279, Street Number 14,<br />New Ranjit Nagar, New Delhi - 110008</p>
              <p style={{ marginTop: "15px", fontSize: "0.95em", opacity: 0.9 }}>
                We aim to respond to all refund requests within 2-3 business days.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Refund;