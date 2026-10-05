import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes";
import "./Dashboard.css";

const SECTIONS = [
  { to: ROUTES.CHATROOMS, title: "Chats", text: "Open your conversations or start a new one." },
  { to: ROUTES.FRIEND_LIST, title: "Friends", text: "See and search the people you're connected with." },
  { to: ROUTES.ADD_FRIEND, title: "Add Friend", text: "Find people and manage friend requests." },
  { to: ROUTES.PROFILE, title: "Profile", text: "Update your details and profile picture." },
];

const Dashboard = () => {
  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      <p className="muted">Welcome back! Where would you like to go?</p>
      <div className="dashboard-grid">
        {SECTIONS.map(({ to, title, text }) => (
          <Link key={to} to={to} className="card dashboard-card">
            <h2>{title}</h2>
            <p>{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
