// src/pages/Register/Register.js
import { useState } from "react";
import { API } from "../../api"; // Import the API endpoints from api.js
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
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful!");
        setError("");
      } else {
        // If there are multiple errors, you might need to join them
        setError(data.message || "Registration failed. Please try again.");
        setMessage("");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setMessage("");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          name="email"
          placeholder="Email (must be a Gmail address)"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number (with country code)"
          value={formData.phone_number}
          onChange={handleChange}
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
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
        <input
          type="password"
          name="password"
          placeholder="Password (min 8 chars, include a letter, number & special char)"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}
    </div>
  );
};

export default Register;
