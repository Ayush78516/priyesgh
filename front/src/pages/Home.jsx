import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCMS } from "../hooks/useCMS";

function Home() {
  const cms = useCMS();

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero" style={cms("hero_bg") ? { backgroundImage: `url(${cms("hero_bg")})` } : {}}>
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>{cms("hero_title", "Empowering the Valuation Profession")}</h1>
            <h2>{cms("hero_badge", "INDUSTRY LEADERSHIP")}</h2>
            <p>
              {cms("hero_desc")
                ? cms("hero_desc").split("<br/>").map((t, i) => <React.Fragment key={i}>{t}<br /></React.Fragment>)
                : <>Future-Ready Valuation Starts Here.<br />Join a professional institution that advances your credibility, competence, and global standing.</>
              }
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">{cms("hero_btn1", "Become a Member")}</button>
              <button className="btn-secondary">{cms("hero_btn2", "Explore Services")}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-image">
            {cms("about_image") && <img src={cms("about_image")} alt="About COV" style={{ width: "100%", borderRadius: 12 }} />}
            <div className="about-badge">Be <span>Valued</span> Be <span>Recognised</span></div>
          </div>
          <div className="about-content">
            <h2>{cms("about_heading", "Welcome to Council of Valuers")}</h2>
            <h3>{cms("about_subheading", "Advancing Excellence in Valuation")}</h3>
            <p>
              {cms("about_text", "At the Council of Valuers (COV), we function as a professional institution committed to strengthening the valuation ecosystem in India through rigour, standards, and informed collaboration.")}
            </p>
            <Link to="/our-story" className="btn-primary">About Us</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section">
        <div className="stats-container">
          <h2 className="stats-title">Boosting Valuation Impact</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">{cms("stats_members", "2500+")}</div>
              <div className="stat-label">Valuers Members Registered</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{cms("stats_vpos", "24")}</div>
              <div className="stat-label">International VPOs Engaged</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{cms("stats_mentors", "30")}</div>
              <div className="stat-label">Chartered Mentors</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{cms("stats_digital", "100%")}</div>
              <div className="stat-label">Digital Services</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OSP ── */}
      <section className="osp">
        <div className="osp1">
          <h2>{cms("osp_title", "One Stop Platform (OSP)")}</h2>
          <div className="osp-content">
            <div className="osp-visual">
              <div className="orbit-container">
                <div className="orbit orbit-1"><div className="orbit-dot"></div></div>
                <div className="orbit orbit-2"><div className="orbit-dot"></div></div>
                <div className="orbit orbit-3"><div className="orbit-dot"></div></div>
                <div className="center-core"></div>
              </div>
            </div>
            <div className="osp-steps">
              <div className="osp-step"><h3>Search Your Requirement Online</h3><p>Select a specialist as per your requirement only at OSP.</p></div>
              <div className="osp-step"><h3>Connect with an Expert</h3><p>Connect directly with our expert members.</p></div>
              <div className="osp-step"><h3>Get a Quote</h3><p>Based on the conversation, our member will provide a quote.</p></div>
              <button className="cta-btn">Join OSP</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section className="ecosystem-section">
        <div className="ecosystem-container">
          <h2 className="ecosystem-title">{cms("ecosystem_title", "Valuation Ecosystem")}</h2>
          <p className="ecosystem-subtitle">{cms("ecosystem_subtitle", "Your journey to becoming a trusted valuation professional starts here.")}</p>
          <div className="ecosystem-items">
            <div className="ecosystem-item"><div className="ecosystem-number">01</div><div className="ecosystem-content"><h3>Capability Building</h3><p>Empowering professionals through structured learning.</p></div></div>
            <div className="ecosystem-item"><div className="ecosystem-number">02</div><div className="ecosystem-content"><h3>Professional Services & Tools</h3><p>Access to OSP and tools.</p></div></div>
            <div className="ecosystem-item"><div className="ecosystem-number">03</div><div className="ecosystem-content"><h3>Community & Collaboration</h3><p>Events and partnerships.</p></div></div>
            <div className="ecosystem-item"><div className="ecosystem-number">04</div><div className="ecosystem-content"><h3>Quality & Oversight</h3><p>Ethical and transparent valuation.</p></div></div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;