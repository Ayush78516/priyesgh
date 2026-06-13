import { useEffect, useRef } from "react";
import { useCMS } from "../hooks/useCMS";

function OurStory() {
  const cms = useCMS();
  const missionPointsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateX(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    missionPointsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-body">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
        </div>
      </section>

      {/* STORY */}
      <section className="story-section" id="our-story">
        <div className="story-content">
          <p className="story-text">
            {cms("story_para1", "At the Council of Valuers (COV), we function as a professional institution committed to strengthening the valuation ecosystem in India through rigour, standards, and informed collaboration. Conceived as a neutral, inclusive platform, COV provides a structured framework that supports valuers across career stages—students, emerging professionals, experienced practitioners, and institutional stakeholders—while aligning practice with evolving domestic and global benchmarks.")}
          </p>
          <p className="story-text">
            {cms("story_para2", "With a focus on integrity, excellence, and global alignment, we promote ethical practice, continuous learning, and international standards — ensuring you are future-ready in a fast-changing valuation environment.")}
          </p>
        </div>
      </section>

      {/* OSP PLATFORM */}
      <section className="osp-section">
        <div className="wrapper">
          <div className="osp-container">
            <div className="platform-visual">
              <div className="platform-icon-circle"></div>
              <div className="platform-icon-main">⚡</div>
              <div className="floating-icons icon-1">👨‍💼</div>
              <div className="floating-icons icon-2">🏗️</div>
              <div className="floating-icons icon-3">📊</div>
              <div className="floating-icons icon-4">🎓</div>
            </div>
            <div className="platform-details">
              <div className="osp-header">
                <div className="osp-badge">{cms("osp_badge", "Our Technology")}</div>
                <h2 className="osp-title">{cms("osp_heading", "Powering Valuers Through Technology: COV's One Stop Platform (OSP)")}</h2>
                <p className="osp-subtitle">{cms("osp_subtitle", "Our flagship One Stop Platform (OSP) makes professional engagement seamless and impactful. Whether you're an individual practitioner or a service seeker, OSP connects you with trusted, qualified professionals.")}</p>
              </div>
              <div className="professionals-list">
                <h3>Connect with Trusted Professionals</h3>
                <div className="professionals-grid">
                  {[
                    { icon: "📋", label: "Chartered Accountants" },
                    { icon: "💰", label: "Cost Accountants" },
                    { icon: "📄", label: "Company Secretaries" },
                    { icon: "🏢", label: "Engineers, Civil Experts & Architects" },
                    { icon: "💼", label: "Finance Professionals with MBA" },
                    { icon: "🎯", label: "Domain Experience Experts" },
                  ].map((item, i) => (
                    <div className="professional-item" key={i}>
                      <div className="professional-icon">{item.icon}</div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="platform-description">Through this dynamic interface, members and clients can collaborate all in one place.</p>
              <div className="platform-closing">With COV and OSP together, you get the best of institutional credibility and digital convenience, empowering you to focus on what matters most: delivering trusted, high-impact valuation services.</div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="mission-vision">
        <div className="wrapper">
          <div className="mission-container">
            <div className="mission-content">
              <div className="label-badge">Our Mission</div>
              <h2 className="mv-title">{cms("mission_heading", "Empowering the Future of Valuation")}</h2>
              <p className="mv-description">{cms("mission_desc", "To cultivate a thriving ecosystem where valuation professionals excel through continuous learning, ethical practice, and innovative collaboration—driving sustainable economic impact and setting new benchmarks for the industry worldwide.")}</p>
              <div className="mission-points">
                {[
                  { icon: "📚", text: "Equip members with continuous learning, certifications, and mentorship opportunities." },
                  { icon: "⚖️", text: "Uphold integrity and professionalism through alignment with international standards." },
                  { icon: "💡", text: "Foster innovation, research, and collaboration to influence valuation policy and practice." },
                  { icon: "🤝", text: "Build a trusted community that drives sustainable economic and societal impact." },
                ].map((point, i) => (
                  <div className="mission-point" key={i} ref={(el) => (missionPointsRef.current[i] = el)}>
                    <div className="point-icon">{point.icon}</div>
                    <p className="point-text">{point.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mission-visual">
              <div className="circle-design circle-1"></div>
              <div className="circle-design circle-2"></div>
              <div className="circle-design circle-3"></div>
            </div>
          </div>

          <div className="vision-container">
            <div className="vision-visual">
              <div className="geometric-layer layer-1" style={{ top: "50%", left: "50%" }}></div>
              <div className="geometric-layer layer-2" style={{ top: "50%", left: "50%" }}></div>
              <div className="geometric-layer layer-3" style={{ top: "50%", left: "50%" }}></div>
              <div className="dot-grid">{Array.from({ length: 36 }).map((_, i) => <div className="grid-dot" key={i}></div>)}</div>
              <div className="floating-bar bar-1"></div><div className="floating-bar bar-2"></div>
              <div className="floating-bar bar-3"></div><div className="floating-bar bar-4"></div>
              <div className="orbit-element orbit-1"></div><div className="orbit-element orbit-2"></div><div className="orbit-element orbit-3"></div>
              <div className="central-element"><div className="central-inner"></div></div>
            </div>
            <div className="vision-content">
              <div className="label-badge vision-badge">Our Valuers</div>
              <h2 className="mv-title">{cms("vision_heading", "Empowering India's Leadership in Global Valuation")}</h2>
              <div className="vision-points">
                {[
                  { heading: "Position COV as a Trusted Valuation Institution", text: "Establish COV as the leading platform representing India's voice in global valuation, driven by professional integrity, ethical conduct, and sectoral impact." },
                  { heading: "Build a Collaborative Ecosystem of Valuers", text: "Foster a vibrant community of students, practitioners, institutions, and global partners united by shared standards, digital tools (like OSP), and professional development." },
                  { heading: "Drive Future-Ready Practices and Thought Leadership", text: "Champion cutting-edge research, policy engagement, and education initiatives that shape the valuation profession in India and influence global frameworks." },
                ].map((point, i) => (
                  <div className="vision-point" key={i}>
                    <div className="point-icon">✦</div>
                    <p><span style={{ fontWeight: 500 }}>{point.heading}</span><br />{point.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OurStory;