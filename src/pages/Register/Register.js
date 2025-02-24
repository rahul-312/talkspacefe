// src/pages/Register/Register.js
import { useState } from "react";
import { API } from "../../api"; // Import the API endpoints from api.js
import { Link } from "react-router-dom"; // Import Link for navigation
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone_number: "",
    username: "",
    first_name: "",
    last_name: "",
    gender: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Basic client-side check for matching passwords
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setMessage("");
      return;
    }
    try {
      const response = await fetch(API.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Exclude confirm_password from the payload if needed by your backend
        body: JSON.stringify({
          email: formData.email,
          phone_number: formData.phone_number,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful!");
        setError("");
      } else {
        setError(data.message || "Registration failed. Please try again.");
        setMessage("");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setMessage("");
    }
  };

  return (
    <div className="container-wrapper">
      <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Email (Gmail)"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}
        <p className="login-link text-center">
          Have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
