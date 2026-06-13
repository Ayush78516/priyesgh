import { Link } from "react-router-dom";

function Footer() {
  return (
    <>
      {/* CONTACT SECTION */}
      <section className="contact-section">
        <div className="contact-container">

          {/* Subscribe */}
          <div className="subscribe-column">
            <h2>STAY CONNECTED</h2>
            <p className="subscribe-text">
              Subscribe to our newsletter for the latest updates and opportunities.
            </p>

            <form className="subscribe-form">
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>

            <p className="no-spam">We respect your privacy. No spam!</p>

            <div className="social-icons">
              <a href="#"><i className="fa-brands fa-facebook"></i></a>
              <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#"><i className="fa-brands fa-linkedin"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-column">
            <h2>REACH US</h2>

            <h3 className="office-title">Registered Office</h3>

            <div className="contact-item">
              <div className="contact-icon">
                <i className="fa-solid fa-location-arrow"></i>
              </div>
              <div className="contact-info">
                <p>
                  2nd Floor, House No. 3279, Street Number 14,<br />
                  New Ranjit Nagar, New Delhi - 110008
                </p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div className="contact-info">
                <p>+91 9599099012</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <i className="fa-regular fa-envelope"></i>
              </div>
              <div className="contact-info">
                <p>covindiaforum@gmail.com</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Divider */}
      <div className="footer-divider-wrapper">
        <div className="footer-divider-inner">
          <hr className="footer-divider" />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <p className="copyright">
            © 2026 Council of Valuers — All Rights Reserved
          </p>

          <p className="developer" style={{ margin: 0, fontSize: "14px" }}>
            Design and Developed by:{" "}
            <a 
              href="https://allitsols.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
            >
              All It Solutions
            </a>
          </p>

          <div className="footer-legal">
            <Link to="/refund">Refund Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;