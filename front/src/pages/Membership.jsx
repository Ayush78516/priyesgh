import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCMS } from "../hooks/useCMS";

// ── Keep all the static data as-is (eligibility, tabs, benefits) ──
const eligibilityData = {
  student: {
    title: "Student Member – Eligibility Criteria",
    rows: [
      { asset: "Plant, Equipment & Infrastructure", education: "Diploma or Degree in Mechanical, Electrical, Electronics & Communication, Electronics & Instrumentation, Production, Chemical, Textiles, Leather, Metallurgy, or Aeronautical Engineering.", experience: "No experience required" },
      { asset: "Land and Building", education: "Diploma or Degree in Civil Engineering, Architecture, or Town Planning.", experience: "No experience required" },
      { asset: "Business Valuation", education: "Diploma or Degree in Finance, Economics, or Business Administration.", experience: "No experience required" },
      { asset: "Financial Instruments", education: "Diploma or Degree in Finance, Economics, or Accounting.", experience: "No experience required" },
    ],
  },
  affiliate: {
    title: "Affiliate Member – Eligibility Criteria",
    rows: [
      { asset: "Plant, Equipment & Infrastructure", education: "Graduate or Diploma in Mechanical, Electrical, Electronics & Communication, Electronics & Instrumentation, Production, Chemical, Textiles, Leather, Metallurgy, or Aeronautical Engineering.", experience: "No experience required" },
      { asset: "Land and Building", education: "Graduate or Diploma in Civil Engineering, Architecture, or Town Planning.", experience: "No experience required" },
      { asset: "Business Valuation", education: "Graduate or Diploma in Finance, Economics, or Business Administration.", experience: "No experience required" },
      { asset: "Financial Instruments", education: "Graduate or Diploma in Finance, Economics, or Accounting.", experience: "No experience required" },
    ],
  },
  chartered: {
    title: "Chartered Member – Eligibility Criteria",
    rows: [
      { asset: "Plant, Equipment & Infrastructure", education: "Graduate in Mechanical, Electrical, Electronics & Communication, Electronics & Instrumentation, Production, Chemical, Textiles, Leather, Metallurgy, or Aeronautical Engineering, OR Postgraduate in these fields or Valuation of Plant and Machinery.", experience: "Minimum of 2 years in valuation; 1 year with postgraduate degree." },
      { asset: "Land and Building", education: "Graduate in Civil Engineering, Architecture, or Town Planning, OR Postgraduate in these fields or Real Estate Valuation.", experience: "No experience required" },
      { asset: "Business Valuation", education: "Member of ICAI, ICSI, or ICWAI, OR MBA (Finance), Graduate in Finance, Economics, or Business Administration, OR Postgraduate in these fields or Business Valuation.", experience: "No experience required" },
      { asset: "Financial Instruments", education: "Member of ICAI, ICSI, or ICWAI, OR MBA (Finance), OR Postgraduate in Finance or Financial Instruments.", experience: "No experience required" },
    ],
  },
  fellow: {
    title: "Fellow Member – Eligibility Criteria",
    rows: [
      { asset: "Plant, Equipment & Infrastructure", education: "Advanced degree in relevant engineering disciplines or Valuation of Plant and Machinery OR recognized expertise in the field.", experience: "Associate Member in Plant, Equipment & Infrastructure who has been in continuous practice in India for at least five years." },
      { asset: "Land and Building", education: "Advanced degree in Civil Engineering, Architecture, Town Planning, or Real Estate Valuation OR recognized expertise.", experience: "Associate Member in Land and Building who has been in continuous practice in India for at least five years." },
      { asset: "Business Valuation", education: "Member of ICAI, ICSI, or ICWAI, OR MBA (Finance), Advanced degree in Finance, Economics, Business Administration, or Business Valuation OR recognized expertise.", experience: "Associate Member in Business Valuation who has been in continuous practice in India for at least five years." },
      { asset: "Financial Instruments", education: "Member of ICAI, ICSI, or ICWAI, OR MBA (Finance), OR Postgraduate in Finance or Financial Instruments.", experience: "Associate Member in Financial Instruments who has been in continuous practice in India for at least five years." },
    ],
  },
  institutional: {
    title: "Corporate & Institutional Member – Eligibility Criteria",
    custom: "Valuation firms, institutions, and organizations aligned with the Institution's goals and the Membership committee will issue Corporate and Institution Membership case to case.",
  },
};

const tabsData = [
  {
    id: "student", label: "Student", cmsKey: "mem_student_title", defaultTitle: "Student Member",
    tagline: "Ideal for current students or recent graduates from academic programmes related to valuation, finance, economics, law, engineering, or real estate.",
    description: "Becoming a Student Member at COV is the perfect first step toward a rewarding career in valuation. This category provides:",
    points: ["Early exposure to the global valuation ecosystem", "Access to learning resources, expert talks, and mentorship opportunities", "Preparation for seamless transition into Affiliate or Chartered membership", "Opportunities to participate in student chapters, case competitions, and forums"],
    closing: "Join a community that empowers future valuation leaders and supports your growth from the ground up.",
  },
  {
    id: "affiliate", label: "Affiliate", cmsKey: "mem_affiliate_title", defaultTitle: "Affiliate Member",
    tagline: "Where Learning Transforms into Practice",
    description: "The Affiliate Membership is tailored for early-career professionals or individuals transitioning into the valuation profession.",
    points: ["A structured and recognised entry point into professional valuation.", "Access to CPD programmes, industry-ready training, and expert mentorship.", "Exposure to hands-on valuation concepts, case studies, and knowledge-sharing forums.", "Build your confidence, network, and capability for regulatory and global opportunities."],
    extraSection: { heading: "Specialised Affiliate Tracks:", items: ["Affiliate (Land & Building Valuation)", "Affiliate (Plant & Machinery Valuation)", "Affiliate (Business Valuation)", "Affiliate (Jewellery & Precious Assets)", "Affiliate (Financial Instruments & Securities)"] },
    closing: "Affiliate Membership is your professional foundation—designed to grow with you.",
  },
  {
    id: "chartered", label: "Chartered", cmsKey: "mem_chartered_title", defaultTitle: "Chartered Member",
    tagline: "Professional Recognition. Global Credibility",
    description: "Chartered Membership represents the core professional grade at COV — designed for individuals who demonstrate a high level of competence, ethical commitment, and applied experience in valuation.",
    points: [{ bold: "Earn the CM-COV Post-Nominal:", text: " A mark of distinction in the valuation profession." }, { bold: "Recognised Professional Status:", text: " Shows you've met rigorous education, experience, and ethical benchmarks." }, { bold: "Access to Premium Opportunities:", text: " Eligible for technical committees, advanced CPD, thought-leadership forums, and mentoring roles." }, { bold: "Global Readiness:", text: " Demonstrates alignment with international standards and ethical valuation practice." }],
    pointsHeading: "Why Become a Chartered Member?",
  },
  {
    id: "fellow", label: "Fellow", cmsKey: "mem_fellow_title", defaultTitle: "Fellow Member",
    tagline: "Where Leadership Meets Legacy",
    description: "The Fellow Membership (FM COV) is the highest recognition awarded by the Council of Valuers, reserved for seasoned professionals who have demonstrated exceptional expertise, leadership, and long-standing contributions to the valuation ecosystem.",
    points: ["Prestigious recognition as a senior leader in the valuation profession.", "Eligibility to chair committees, mentor future professionals, and represent COV globally.", "Access to high-level consultations, expert panels, and policymaking dialogues.", "Demonstrates your role in shaping standards, strategy, and the future of valuation in India and abroad."],
    pointsHeading: "Why Become a Fellow Member?",
  },
  {
    id: "institutional", label: "Institutional", cmsKey: null, defaultTitle: "Institutional Member",
    tagline: "Strengthening Valuation through Organisational Commitment",
    description: "The Corporate & Institutional Membership is designed for valuation firms, academic institutions, training bodies, research centres, and organisations that share COV's commitment to advancing professional standards in valuation.",
    points: ["Valuation firms and consultancies", "Universities, colleges, and research institutions", "Sector skill councils, financial institutions, and government agencies", "Industry associations supporting valuation as a discipline"],
    pointsHeading: "Who Is This For?",
  },
];

const benefits = [
  { num: 1, title: "Professional Recognition", desc: "Your credentials are backed by a reputable institution aligned with international standards." },
  { num: 2, title: "Learning & Development", desc: "Workshops, certifications, webinars, and CPD tracking—designed to keep you future-ready." },
  { num: 3, title: "Global Standards & Tools", desc: "Stay updated with the latest valuation methodologies, IVS-aligned practices, and digital tools." },
  { num: 4, title: "Career Support", desc: "Mentorship, networking events, and listings on COV's One Stop Platform (OSP)." },
  { num: 5, title: "Thought Leadership", desc: "Contribute to journals, working groups, committees, and global initiatives like V20." },
  { num: 6, title: "Collaborative Community", desc: "Engage with peers, industry experts, and stakeholders shaping the valuation profession." },
];

function EligibilityModal({ type, onClose }) {
  const data = eligibilityData[type];
  if (!data) return null;
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  return (
    <div className="eligibility-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eligibility-modal">
        <button className="close-modal" onClick={onClose}>&times;</button>
        <div className="eligibility-scroll">
          <div id="eligibilityDynamicContent">
            <h4>{data.title}</h4>
            {data.custom ? (
              <p style={{ marginTop: "20px", fontSize: "15px", lineHeight: "1.7" }}>{data.custom}</p>
            ) : (
              <table className="eligibility-table">
                <thead><tr><th>Asset Class</th><th>Education</th><th>Experience</th></tr></thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={i}><td>{row.asset}</td><td>{row.education}</td><td>{row.experience}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Membership() {
  const cms = useCMS();
  const [activeTab, setActiveTab] = useState("student");
  const [modalType, setModalType] = useState(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const h1 = document.querySelector(".hero-section h1");
    const p = document.querySelector(".hero-section p");
    if (h1) setTimeout(() => { h1.style.transition = "all 0.8s ease"; h1.style.opacity = "1"; h1.style.transform = "translateY(0)"; }, 100);
    if (p) setTimeout(() => { p.style.transition = "all 0.8s ease"; p.style.opacity = "1"; p.style.transform = "translateY(0)"; }, 400);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { const idx = cardsRef.current.indexOf(entry.target); setTimeout(() => { entry.target.style.transition = "all 0.8s ease"; entry.target.classList.add("fade-in-visible"); }, idx * 150); observer.unobserve(entry.target); } }); },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    cardsRef.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const activeTabData = tabsData.find(t => t.id === activeTab);

  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content" style={{ display: "block" }}>
          <h1>{cms("mem_hero_title", "Membership at COV")}</h1>
          <p>{cms("mem_hero_desc", "At COV, membership is more than a credential—it's a commitment to excellence, integrity, and lifelong learning in the valuation profession. Whether you're a student, an emerging practitioner, or a seasoned expert, we offer a pathway tailored to your stage of professional growth.")}</p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="categories-container">
          <h2 className="section-title">{cms("mem_section_title", "Membership Categories")}</h2>
          <p className="section-subtitle">{cms("mem_section_sub", "Supporting valuation professionals through every phase of practice and growth.")}</p>

          <div className="categories-tabs">
            {tabsData.map(tab => (
              <button key={tab.id} className={`tab-btn${activeTab === tab.id ? " active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTabData && (() => {
            const id = activeTabData.id;
            // Pull CMS values with hardcoded fallbacks
            const tabTitle = activeTabData.cmsKey
              ? cms(activeTabData.cmsKey, activeTabData.defaultTitle)
              : activeTabData.defaultTitle;
            const tagline = cms(`mem_${id}_tagline`, activeTabData.tagline);
            const description = cms(`mem_${id}_desc`, activeTabData.description);
            // Points: CMS gives newline-separated string; fall back to static array
            const cmsPoints = cms(`mem_${id}_points`, "");
            const pointsList = cmsPoints
              ? cmsPoints.split("\n").filter(Boolean)
              : activeTabData.points.map(p => typeof p === "string" ? p : `${p.bold}${p.text}`);
            const closing = cms(`mem_${id}_closing`, activeTabData.closing || "");

            return (
              <div className="tab-content active">
                <h3>{tabTitle}</h3>
                <p><span className="tagline">{tagline}</span><br /><br />{description}</p>

                {activeTabData.pointsHeading && (
                  <ul>
                    <span style={{ fontWeight: 500, fontSize: "large" }}>{activeTabData.pointsHeading}</span>
                    {pointsList.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                )}
                {!activeTabData.pointsHeading && (
                  <ul>{pointsList.map((point, i) => <li key={i}>{point}</li>)}</ul>
                )}
                {activeTabData.extraSection && (
                  <ul>
                    <span style={{ fontWeight: 500, fontSize: "large" }}>{activeTabData.extraSection.heading}</span>
                    <div style={{ marginLeft: "30px", marginTop: "10px" }}>
                      <ul>{activeTabData.extraSection.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                  </ul>
                )}
                {closing && <p>{closing}</p>}
                <button className="popup" onClick={() => setModalType(activeTab)}>Check Eligibility</button>
                <Link to={`/register?memberClass=${encodeURIComponent(id)}`} className="register-btn1">Register Now</Link>
              </div>
            );
          })()}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section">
        <div className="benefits-container">
          <h2 className="section-title">{cms("mem_benefits_title", "Member Benefits")}</h2>
          <div className="benefits-grid">
            {benefits.map((b, i) => (
              <div key={b.num} className="benefit-card" ref={(el) => (cardsRef.current[i] = el)}>
                <div className="benefit-number">{b.num}</div>
                <h3>{cms(`mem_benefit_${b.num}_title`, b.title)}</h3>
                <p>{cms(`mem_benefit_${b.num}_desc`, b.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {modalType && <EligibilityModal type={modalType} onClose={() => setModalType(null)} />}
    </>
  );
}

export default Membership;


