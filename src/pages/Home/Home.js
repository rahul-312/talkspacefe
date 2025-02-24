// src/pages/Home/Home.js
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-wrapper">
      <header className="hero">
        <h1>Welcome to Our Platform</h1>
        <p>
          Connect, share, and grow with our amazing community.
        </p>
        <div className="hero-buttons">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </div>
      </header>
    </div>
  );
};

export default Home;
