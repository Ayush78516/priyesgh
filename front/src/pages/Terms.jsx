const sections = [
  {
    num: 1,
    title: "Acceptance of Terms",
    content: "By accessing this website or availing our services, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms & Conditions. If you do not agree with any part of these terms, please refrain from using our services.",
  },
  {
    num: 2,
    title: "Services",
    content: "Confederation of Valuers (COV) provides professional services including but not limited to:",
    list: [
      "Professional valuation consultancy services",
      "Training programs and certifications",
      "Membership and networking opportunities",
      "Digital platform access and tools",
      "Online bookings and event registrations",
      "Paid packages and subscription services",
    ],
    footer: "Service details, pricing, and scope are clearly mentioned on the website and may be updated or changed without prior notice. It is your responsibility to review these terms periodically.",
  },
  {
    num: 3,
    title: "Payments",
    highlight: [
      "All payments are processed through secure third-party payment gateways.",
      "Prices are listed in INR (Indian Rupees) unless stated otherwise.",
      "Payment must be completed in full before service delivery or access is granted.",
      "We do not store your card, UPI, or banking details on our servers.",
    ],
    footer: "All transactions are subject to verification. COV reserves the right to cancel or refund transactions that appear fraudulent or suspicious.",
  },
  {
    num: 4,
    title: "User Responsibilities",
    content: "By using our website and services, you agree to:",
    list: [
      "Provide accurate, current, and complete information during registration",
      "Maintain the confidentiality of your account credentials",
      "Not misuse the website, services, or platform features",
      "Not attempt fraud, hacking, or unauthorized access to our systems",
      "Comply with all applicable laws and regulations",
      "Not engage in activities that harm COV's reputation or operations",
    ],
  },
  {
    num: 5,
    title: "Intellectual Property",
    content: "All content on this website, including but not limited to logos, text, graphics, images, videos, designs, software, and trademarks, are the exclusive property of Confederation of Valuers (COV) and are protected by intellectual property laws.",
    footer: "You may not copy, reproduce, distribute, modify, or create derivative works from any content without prior written permission from COV.",
  },
  {
    num: 6,
    title: "Limitation of Liability",
    content: "COV shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:",
    list: [
      "Use or inability to use our services or website",
      "Unauthorized access to or alteration of your data",
      "Technical failures, interruptions, or errors",
      "Third-party content or services linked on our platform",
    ],
    footer: "Our total liability shall not exceed the amount paid by you for the specific service in question.",
  },
  {
    num: 7,
    title: "Termination",
    content: "We reserve the right to suspend, restrict, or terminate your access to our services at any time if you violate these Terms & Conditions or engage in unlawful, fraudulent, or harmful activities. Termination may occur without prior notice.",
  },
  {
    num: 8,
    title: "Governing Law",
    content: "These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.",
  },
  {
    num: 9,
    title: "Changes to Terms",
    content: 'COV reserves the right to modify or update these Terms & Conditions at any time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the revised terms.',
  },
];

function Terms() {
  return (
    <div className="tandc-page">
      {/* HERO */}
      <section className="hero">
        <h1>Terms &amp; Conditions</h1>
        <p className="last-updated">Last Updated: January 19, 2026</p>
      </section>

      {/* MAIN CONTENT */}
      <div className="terms-container1">
        <div className="terms-content1">
          <p className="intro-text1">
            Welcome to Confederation of Valuers (COV). By accessing or using
            our website and services, you agree to comply with and be bound by
            the following Terms and Conditions. Please read them carefully
            before making any payment or using our services.
          </p>

          {sections.map((section) => (
            <div className="terms-section1" key={section.num}>
              <h2>
                <span className="section-number1">{section.num}</span>{" "}
                {section.title}
              </h2>

              {section.content && <p>{section.content}</p>}

              {section.highlight && (
                <div className="highlight-box1">
                  {section.highlight.map((item, i) => (
                    <p key={i}>{item}</p>
                  ))}
                </div>
              )}

              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {section.footer && <p>{section.footer}</p>}
            </div>
          ))}

          {/* Section 10 - Contact */}
          <div className="terms-section1">
            <h2>
              <span className="section-number1">10</span> Contact Information
            </h2>
            <p>
              If you have any questions, concerns, or require clarification
              regarding these Terms &amp; Conditions, please contact us:
            </p>
            <div className="contact-box1">
              <h3>Get in Touch</h3>
              <p>📧 Email: <a href="mailto:covindiaforum@gmail.com">covindiaforum@gmail.com</a></p>
              <p>📞 Phone: <a href="tel:+919599099012">+91 9599099012</a></p>
              <p>
                📍 Address: 2nd Floor, House No. 3279, Street Number 14,
                <br />New Ranjit Nagar, New Delhi - 110008
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Terms;