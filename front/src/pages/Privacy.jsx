const sections = [
  {
    num: 1,
    title: "Information We Collect",
    content: "We may collect the following types of information:",
    list: [
      "Name and contact information",
      "Email address and phone number",
      "Professional credentials and qualifications",
      "Payment transaction ID (not card/UPI details)",
      "Service preferences and usage data",
    ],
  },
  {
    num: 2,
    title: "How We Use Your Information",
    content: "Your data is used to:",
    list: [
      "Provide and manage our services effectively",
      "Process payments and membership registrations",
      "Communicate updates, confirmations, and important notices",
      "Improve website functionality and user experience",
      "Maintain security and prevent fraudulent activities",
    ],
  },
  {
    num: 3,
    title: "Data Protection",
    content: "We are committed to protecting your personal information:",
    list: [
      "We use secure technologies and industry-standard encryption",
      "We do not sell, rent, or share personal data with third parties",
      "Access to data is restricted to authorized personnel only",
      "Regular security audits are conducted to ensure data safety",
    ],
  },
  {
    num: 4,
    title: "Third-Party Services",
    content:
      "We use trusted third-party services such as payment gateways, email providers, and analytics tools that comply with standard security practices and data protection regulations. These services are carefully selected to ensure your data remains secure.",
  },
  {
    num: 5,
    title: "Cookies",
    content:
      "Our website may use cookies to enhance user experience, remember preferences, and analyze site traffic. You can disable cookies in your browser settings, though this may affect certain website functionalities.",
  },
  {
    num: 6,
    title: "Your Rights",
    content: "You have the right to:",
    list: [
      "Request access to your personal data",
      "Request correction or deletion of your information",
      "Withdraw consent at any time",
      "Object to processing of your data",
      "Request data portability",
    ],
  },
  {
    num: 7,
    title: "Policy Updates",
    content:
      'This Privacy Policy may be updated periodically to reflect changes in our practices or legal requirements. We will notify users of any significant changes by posting the updated policy on this page with a revised "Last Updated" date.',
  },
];

function Privacy() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: January 19, 2026</p>
      </section>

      {/* MAIN CONTENT */}
      <div className="policy-container">
        <div className="policy-content">
          <p className="intro-text">
            At Confederation of Valuers (COV), your privacy is extremely
            important to us. This Privacy Policy explains how we collect, use,
            and protect your information when you interact with our platform and
            services.
          </p>

          {sections.map((section) => (
            <div className="policy-section" key={section.num}>
              <h2>
                <span className="section-number">{section.num}</span>{" "}
                {section.title}
              </h2>
              <p>{section.content}</p>
              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Section 8 - Contact */}
          <div className="policy-section">
            <h2>
              <span className="section-number">8</span> Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or how we handle your personal information, please
              feel free to contact us:
            </p>
            <div className="contact-box">
              <h3>Get in Touch</h3>
              <p>
                📧 Email:{" "}
                <a href="mailto:covindiaforum@gmail.com">covindiaforum@gmail.com</a>
              </p>
              <p>
                📞 Phone:{" "}
                <a href="tel:+919599099012">+91 9599099012</a>
              </p>
              <p>
                📍 2nd Floor, House No. 3279, Street Number 14,
                <br />
                New Ranjit Nagar, New Delhi - 110008
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Privacy;