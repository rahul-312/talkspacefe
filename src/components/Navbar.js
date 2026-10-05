import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import "./Navbar.css";
import { logout, clearAuth, isAuthenticated } from "../api";
import { ROUTES } from "../routes";

const PRIVATE_LINKS = [
  { to: ROUTES.DASHBOARD, label: "Dashboard" },
  { to: ROUTES.FRIEND_LIST, label: "Friends" },
  { to: ROUTES.ADD_FRIEND, label: "Add Friend" },
  { to: ROUTES.CHATROOMS, label: "Chat" },
];

const PUBLIC_LINKS = [
  { to: ROUTES.LOGIN, label: "Login" },
  { to: ROUTES.REGISTER, label: "Register" },
];

const navLinkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
    } else {
      // expired or malformed tokens shouldn't linger in storage
      clearAuth();
      setIsLoggedIn(false);
    }
    setIsDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggedIn(false);
      setIsDropdownOpen(false);
      // replace so Back can't return to an authenticated page
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  const links = isLoggedIn ? PRIVATE_LINKS : PUBLIC_LINKS;

  return (
    <nav className={`nav ${isScrolled ? "scrolled" : ""}`}>
      <Link to={ROUTES.HOME} className="nav-brand">
        TalkSpace
      </Link>
      <ul className="nav-links">
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to} className={navLinkClass}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      {isLoggedIn && (
        <div className="nav-right" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((open) => !open)}
            className="settings-btn"
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            aria-label="Settings"
          >
            <FaCog aria-hidden="true" />
            <span className="settings-label">Settings</span>
            <span aria-hidden="true">▾</span>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu" role="menu">
              <Link to={ROUTES.PROFILE} className="dropdown-item" role="menuitem">
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="dropdown-item logout-btn"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
