import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email;
    return "User";
  };

  return (
    <header>
      <div className="header-content">

        {/* Logo */}
        <div className="logo-container">
          <Link to="/">
            <img
              id="logo"
              src="/assets/Logo.avif"
              height="70px"
              alt="COV Logo"
            />
          </Link>
        </div>

        {/* Hamburger */}
        <button className={menuOpen ? "hamburger active" : "hamburger"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation */}
        <nav className={menuOpen ? "active" : ""}>
          <Link to="/membership">Membership</Link>
          <Link to="/training">Training & Courses</Link>
          <Link to="/events">Events</Link>

          <div className={`nav-item${dropdownOpen ? " mobile-active" : ""}`}>
            <div className="nav-item-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: "pointer" }}
            >
              About Us <span className={dropdownOpen ? "dropdown-arrow active" : "dropdown-arrow"}>▼</span>
            </div>

            <div className="dropdown">
              <Link to="/our-story">Our Story</Link>
              <Link to="/bod">Board of Directors</Link>
              <Link to="/committee">Committee</Link>
              <Link to="/bylaws">By Laws</Link>
            </div>
          </div>

          <Link to="/covsphere">COV Sphere</Link>
          <Link to="/contact">Contact</Link>


          {/* Right Buttons */}
          <div className="nav-right mobile">
            {user ? (
              <div className="profile-menu" ref={profileRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  title={getDisplayName()}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "#00a6a6", border: "2px solid #fff",
                    color: "#fff", fontWeight: 700, fontSize: 14,
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", boxShadow: "0 2px 8px rgba(0,166,166,0.3)"
                  }}
                >
                  {getInitials()}
                </button>

                {profileOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 10px)",
                    background: "#fff", borderRadius: 12, minWidth: 220,
                    boxShadow: "0 8px 32px rgba(0,43,91,0.15)",
                    border: "0.5px solid rgba(0,43,91,0.12)", zIndex: 9999, overflow: "hidden"
                  }}>
                    {/* Header */}
                    <div style={{ padding: "16px", borderBottom: "1px solid #e8f4f8", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: "50%", background: "#00a6a6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0
                      }}>
                        {getInitials()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#002b5b" }}>{getDisplayName()}</div>
                        <div style={{ fontSize: 12, color: "#6b8099", marginTop: 2 }}>{user.email || ""}</div>
                      </div>
                    </div>


                    {!(user?.role === "admin" || user?.role === "super-admin") && (
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "12px 16px", fontSize: 14, color: "#012a4a",
                          textDecoration: "none", borderBottom: "1px solid #e8f4f8"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f2f9ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: 16 }}>🪪</span> Dashboard
                      </Link>
                    )}

                    {(user?.role === "admin" || user?.role === "super-admin") && (
                      <Link
                        to="/admin-dashboard"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "12px 16px", fontSize: 14, color: "#012a4a",
                          textDecoration: "none", borderBottom: "1px solid #e8f4f8"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f2f9ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: 16 }}>🪪</span> Dashboard
                      </Link>
                    )}


                    {/* Logout button */}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 16px", fontSize: 14, color: "#c0392b",
                        background: "none", border: "none", width: "100%",
                        textAlign: "left", cursor: "pointer"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: 16 }}>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/register" className="register-btn">Register Now</Link>
                <Link to="/login" className="login-btn">Login</Link>
              </>
            )}
          </div>
        </nav>
      </div>

      <div className={`menu-overlay ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(false)} />
    </header>
  );
}

export default Header;