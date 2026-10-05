import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <header className="hero">
        <h1>Welcome to TalkSpace</h1>
        <p>Connect, share, and grow with our amazing community.</p>
        <div className="hero-buttons">
          <Link to={ROUTES.LOGIN} className="btn btn-secondary">Login</Link>
          <Link to={ROUTES.REGISTER} className="btn btn-primary">Sign Up</Link>
        </div>
      </header>
    </div>
  );
};

export default Home;
