import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("userEmail");
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => handleNavClick("/")}>
          <span className="logo-icon">✈️</span>
          <span className="logo-text">TripCraft AI</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          <button
            onClick={() => handleNavClick("/")}
            className="nav-link"
          >
            Home
          </button>

          {user && (
            <>
              <button
                onClick={() => handleNavClick("/plan-trip")}
                className="nav-link"
              >
                📝 Plan Trip
              </button>
              <button
                onClick={() => handleNavClick("/explore-nearby")}
                className="nav-link"
              >
                🗺️ Explore Nearby
              </button>
            </>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              <div className="user-badge">
                <div className="user-avatar">👤</div>
                <span>{user.split("@")[0]}</span>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => handleNavClick("/login")}>
                Login
              </button>
              <button className="btn-signup" onClick={() => handleNavClick("/signup")}>
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-nav-links">
            <button
              onClick={() => handleNavClick("/")}
              className="mobile-nav-link"
            >
              Home
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNavClick("/plan-trip")}
                  className="mobile-nav-link"
                >
                  📝 Plan Trip
                </button>
                <button
                  onClick={() => handleNavClick("/explore-nearby")}
                  className="mobile-nav-link"
                >
                  🗺️ Explore Nearby
                </button>
              </>
            )}
          </div>

          <div className="mobile-divider"></div>

          <div className="mobile-auth-section">
            {user ? (
              <>
                <div className="mobile-user-badge">
                  <div className="user-avatar">👤</div>
                  <span>{user.split("@")[0]}</span>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn-login" onClick={() => handleNavClick("/login")}>
                  Login
                </button>
                <button className="btn-signup" onClick={() => handleNavClick("/signup")}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
