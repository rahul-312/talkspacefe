// src/pages/Register/Register.js
import { useState } from "react";
import { API } from "../../api";
import { Link } from "react-router-dom";
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
    profile_picture: null,  // Updated to handle file object
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Updated profile picture handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or GIF)");
        setFormData({ ...formData, profile_picture: null });
        return;
      }
      
      if (file.size > maxSize) {
        setError("Image size must be less than 5MB");
        setFormData({ ...formData, profile_picture: null });
        return;
      }
      
      setError(""); // Clear any previous errors
      setFormData({ ...formData, profile_picture: file });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setMessage("");
      return;
    }
    
    // Use FormData to handle file upload
    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'confirm_password' && value !== null) {
        formPayload.append(key, value);
      }
    });

    try {
      const response = await fetch(API.REGISTER, {
        method: "POST",
        body: formPayload, // Send FormData instead of JSON
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
          {/* Updated profile picture input */}
          <div className="form-row">
            <input
              type="file"
              name="profile_picture"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif"
            />
            {formData.profile_picture && (
              <span className="file-name">
                {formData.profile_picture.name}
              </span>
            )}
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