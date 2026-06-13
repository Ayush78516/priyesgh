import { useEffect, useRef, useState } from "react";
import { useCMS } from "../hooks/useCMS";

function Contact() {
  const cms = useCMS();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [toast, setToast] = useState(null); // { msg, type: "success"|"error" }
  const contactGridRef = useRef(null);
  const mapSectionRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (res.ok) {
        showToast(data?.message || "✅ Message sent successfully! We'll get back to you shortly.", "success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        const firstValidationMsg = Array.isArray(data?.errors) ? data.errors[0]?.msg : null;
        const errMsg = firstValidationMsg || data?.message || "Something went wrong. Please try again.";
        showToast(`❌ ${errMsg}`, "error");
      }
    } catch (err) {
      showToast("❌ Something went wrong. Please try again.", "error");
    }
  };

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px" };
    const formTitle = document.querySelector(".contact-form-section h2");
    const infoTitle = document.querySelector(".contact-info-section h2");
    const formGroups = document.querySelectorAll(".contact-form-section .form-group");
    const submitBtn = document.querySelector(".submit-btn");
    const infoItems = document.querySelectorAll(".info-item");

    [formTitle, infoTitle, submitBtn].forEach(el => { if (el) { el.style.opacity = "0"; el.style.transform = "translateY(20px)"; } });
    [...formGroups, ...infoItems].forEach(el => { el.style.opacity = "0"; el.style.transform = "translateY(20px)"; });

    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          [formTitle, infoTitle].forEach(el => { if (el) setTimeout(() => { el.style.transition = "all 0.8s ease"; el.style.opacity = "1"; el.style.transform = "translateY(0)"; }, 200); });
          [...formGroups].forEach((el, i) => { setTimeout(() => { el.style.transition = "all 0.6s ease"; el.style.opacity = "1"; el.style.transform = "translateY(0)"; }, 400 + i * 100); });
          [...infoItems].forEach((el, i) => { setTimeout(() => { el.style.transition = "all 0.6s ease"; el.style.opacity = "1"; el.style.transform = "translateX(0)"; }, 400 + i * 100); });
          if (submitBtn) setTimeout(() => { submitBtn.style.transition = "all 0.8s ease"; submitBtn.style.opacity = "1"; submitBtn.style.transform = "translateY(0)"; }, 400 + formGroups.length * 100);
          gridObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (contactGridRef.current) gridObserver.observe(contactGridRef.current);

    const mapEl = mapSectionRef.current;
    if (mapEl) {
      mapEl.style.opacity = "0"; mapEl.style.transform = "translateY(40px)";
      const mapObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { mapEl.style.transition = "all 0.8s ease"; mapEl.style.opacity = "1"; mapEl.style.transform = "translateY(0)"; mapObserver.unobserve(entry.target); }
        });
      }, observerOptions);
      mapObserver.observe(mapEl);
    }
    return () => gridObserver.disconnect();
  }, []);

  // Build info items from CMS with fallbacks
  const infoItems = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Address",
      content: cms("contact_address", "House No. 3279, 2nd Floor, Street Number 14, New Ranjit Nagar, New Delhi - 110008"),
    },
    {
      icon: "fas fa-phone-alt",
      title: "Phone",
      content: <a href={`tel:${cms("contact_phone", "+919599099012")}`}>{cms("contact_phone", "+91 9599099012")}</a>,
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      content: <a href={`mailto:${cms("contact_email", "covindiaforum@gmail.com")}`}>{cms("contact_email", "covindiaforum@gmail.com")}</a>,
    },
    {
      icon: "fas fa-clock",
      title: "Working Hours",
      content: cms("contact_hours", "Mon - Sat: 9:00 AM - 5:00 PM | Sunday: Closed"),
    },
  ];

  // Bank details from CMS
  const bankDetails = [
    { label: "Bank Name", value: cms("bank_name", "Yes Bank Ltd") },
    { label: "Account Number", value: cms("bank_account", "020588700000262") },
    { label: "IFSC Code", value: cms("bank_ifsc", "YESB0000205") },
    { label: "Branch", value: cms("bank_branch", "Karol Bagh, New Delhi") },
  ];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>{cms("contact_hero_title", "Get In Touch")}</h1>
        <p>{cms("contact_hero_desc", "We'd love to hear from you. Reach out to us anytime!")}</p>
      </section>

      {/* Styled Toast Notification — replaces browser alert() */}
      {toast && (
        <div style={{
          position: "fixed",
          top: 90,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          padding: "16px 32px",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "inherit",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          background: toast.type === "success"
            ? "linear-gradient(135deg, #002b5b, #00a6a6)"
            : "linear-gradient(135deg, #7f1d1d, #ef4444)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 320,
          maxWidth: "90vw",
          animation: "slideDown 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <span style={{ fontSize: 22 }}>{toast.type === "success" ? "✅" : "❌"}</span>
          <div style={{ flex: 1 }}>
            <div>{toast.type === "success" ? "Message Sent!" : "Send Failed"}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2, fontWeight: 400 }}>
              {toast.type === "success"
                ? "We've received your message and will get back to you shortly."
                : "Something went wrong. Please try again or email us directly."}
            </div>
          </div>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", opacity: 0.7, padding: "0 4px", lineHeight: 1 }}>✕</button>
        </div>
      )}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="container">

        {/* Contact Grid */}
        <div className="contact-grid" ref={contactGridRef}>
          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} required /></div>
              <div className="form-group"><input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} required /></div>
              <div className="form-group"><input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} /></div>
              <div className="form-group"><input type="text" name="subject" placeholder="Subject *" value={formData.subject} onChange={handleChange} required /></div>
              <div className="form-group"><textarea name="message" placeholder="Message *" value={formData.message} onChange={handleChange} required /></div>
              <button type="submit" className="submit-btn">SEND MESSAGE</button>
            </form>
          </div>

          <div className="contact-info-section">
            <h2>Contact Information</h2>
            {infoItems.map((item, i) => (
              <div className="info-item" key={i}>
                <div className="info-icon"><i className={item.icon}></i></div>
                <div className="info-content"><h3>{item.title}</h3><p>{item.content}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="map-section" ref={mapSectionRef}>
          <h2>Find Us on Map</h2>
          <div className="map-container">
            <p><i className="fas fa-map-marked-alt" style={{ fontSize: "2em" }}></i><br />Map</p>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bank-details-section">
          <h2>Bank Details</h2>
          <div className="bank-card">
            <div className="bank-header">
              <i className="fas fa-university"></i>
              <h3>COV India Forum</h3>
            </div>
            <div className="bank-info-grid">
              {bankDetails.map((item, i) => (
                <div className="bank-info-item" key={i}>
                  <div className="bank-label">{item.label}</div>
                  <div className="bank-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Contact;
