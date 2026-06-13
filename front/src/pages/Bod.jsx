import { useEffect, useState } from "react";
import { directors as defaultDirectors } from "../data/bodinfo";
import { useCMS } from "../hooks/useCMS";

function BODPage() {
  const cms = useCMS();
  const [selectedDirector, setSelectedDirector] = useState(null);

  // directors starts as the original hardcoded data from bodinfo.js
  // If admin has added/edited/removed cards via the CMS panel, those override it
  const [directors, setDirectors] = useState(defaultDirectors);

  // Try to load admin-managed BOD cards from CMS
  // If found and non-empty, they replace the defaultDirectors
  // If not found, the original bodinfo.js data is used unchanged
  useEffect(() => {
    const loadCMSCards = async () => {
      try {
        const res = await fetch(`/api/public/cms?t=${Date.now()}`);
        const data = await res.json();
        if (!data.success) return;
        const item = data.data.find(
          (i) => i.key === "bod_cards" && i.value && i.value !== "__deleted__"
        );
        if (item) {
          const parsed = JSON.parse(item.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDirectors(parsed);
          }
        }
        // If no "bod_cards" key in CMS → keep defaultDirectors (nothing changes)
      } catch {
        // On error → keep defaultDirectors
      }
    };
    loadCMSCards();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && selectedDirector) setSelectedDirector(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedDirector]);

  useEffect(() => {
    document.body.style.overflow = selectedDirector ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedDirector]);

  return (
    <>
      {/* HERO — CMS driven */}
      <section className="hero">
        <div className="hero-content">
          <h1>{cms("bod_hero_title", "Meet Our Board of Directors")}</h1>
          <p>{cms("bod_hero_desc", "At COV, our Board of Directors brings together a distinguished group of leaders from diverse fields—including valuation, finance, infrastructure, public policy, and cooperative development. Their collective expertise and vision guide our mission to elevate professional standards, foster innovation, and build a globally aligned, ethically grounded valuation ecosystem. Together, they ensure that COV remains an institution driven by impact, inclusion, and integrity.")}</p>
        </div>
      </section>

      {/* DIRECTORS GRID */}
      <section className="directors-section">
        <div className="directors-container">
          <div className="directors-grid">
            {directors.map((d) => (
              <div className="director-card" key={d.id}>
                <div className="director-image">
                  {d.image
                    ? <img src={d.image} alt={d.name} />
                    : <i className="fas fa-user-tie" />
                  }
                </div>
                <h3 className="director-name">{d.name}</h3>
                <p className="director-title">{d.title}</p>
                <p className="director-bio-preview">{d.preview}</p>
                <button
                  className="read-more-btn"
                  onClick={(e) => { e.stopPropagation(); setSelectedDirector(d); }}>
                  Read More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {selectedDirector && (
        <div
          className="modal-backdrop active"
          onClick={() => setSelectedDirector(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDirector(null)}>✕</button>
            <div className="modal-header">
              <div className="modal-image">
                {selectedDirector.image
                  ? <img src={selectedDirector.image} alt={selectedDirector.name} />
                  : <i className="fas fa-user-tie" />
                }
              </div>
              <h2 className="modal-name">{selectedDirector.name}</h2>
              <p className="modal-title">{selectedDirector.title}</p>
            </div>
            <p className="modal-bio">{selectedDirector.bio}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default BODPage;