import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Navbar.css";
import { API, apiConfig } from "../api";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const checkAuthStatus = () => {
    const refreshToken = localStorage.getItem("refresh_token");
    setIsAuthenticated(!!refreshToken);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    const unsubscribe = navigate(() => {
      checkAuthStatus();
    });
    return () => unsubscribe;
  }, [navigate]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        API.LOGOUT,
        { refresh: refreshToken },
        {
          timeout: apiConfig.timeout,
          headers: apiConfig.headers,
        }
      );
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  return (
    <nav className={`nav ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-left">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/friend-list">Friendlist</Link>
              </li>
              <li>
                <Link to="/add-friend">Add Friend</Link>
              </li>
            </>
          )}
          {!isAuthenticated && (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
      {isAuthenticated && (
        <div className="nav-right">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;