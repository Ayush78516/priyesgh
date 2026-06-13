import { useEffect, useRef } from "react";

const cards = [
  {
    title: "Articles & Journals",
    description: "Latest insights from practitioners, global valuation trends",
    cta: "Coming Soon",
    href: null,
  },
  {
    title: "Standards & Manuals",
    description: "Downloadable guidance notes, standards (IVS, Indian), practice aids",
    cta: "Read More",
    href: "#",
  },
  {
    title: "Valuers' Blog",
    description: "News, member updates, new training launches, personal journeys",
    cta: "Read More",
    href: "#",
  },
];

function CovSphere() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cardsRef.current.indexOf(entry.target);
            setTimeout(() => {
              entry.target.style.transition = "all 0.8s ease";
              entry.target.classList.add("fade-in-visible");
            }, idx * 150);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    cardsRef.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>The Hive</h1>
      </section>

      {/* CARDS */}
      <section className="hive-section">
        <div className="cards-container">
          {cards.map((card, i) => (
            <article
              className="card"
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
            >
              <h2 className="card-title">{card.title}</h2>
              <p className="card-description">{card.description}</p>
              {card.href ? (
                <a href={card.href} className="card-cta">{card.cta}</a>
              ) : (
                <span className="card-cta">{card.cta}</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default CovSphere;