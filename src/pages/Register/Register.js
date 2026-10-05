// src/pages/Register/Register.js
import { useState } from "react";
import { register, errorMessage } from "../../api";
import { Link, useNavigate } from "react-router-dom";
import { validatePassword, validateImageFile } from "../../utils/validation";
import { ROUTES } from "../../routes";
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
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Updated profile picture handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileError = validateImageFile(file);
      if (fileError) {
        setError(fileError);
        setFormData({ ...formData, profile_picture: null });
        e.target.value = "";
        return;
      }

      setError(""); // Clear any previous errors
      setFormData({ ...formData, profile_picture: file });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setMessage("");
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setMessage("");
      return;
    }

    // Use FormData to handle file upload
    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'confirm_password' && value !== null) {
        formPayload.append(key, typeof value === "string" ? value.trim() : value);
      }
    });

    setSubmitting(true);
    try {
      await register(formPayload);
      setMessage("Registration successful! Redirecting to login...");
      setError("");
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2000);
    } catch (err) {
      setError(errorMessage(err, "Registration failed. Please try again."));
      setMessage("");
    } finally {
      // Don't keep passwords in memory longer than needed.
      setFormData((prev) => ({ ...prev, password: "", confirm_password: "" }));
      setSubmitting(false);
    }
  };

  return (
    <div className="page-center register-page">
      <div className="card auth-card register-card">
        <h1>Create your account</h1>
        <form onSubmit={handleRegister}>
          <div className="form-row">
            <input
              type="email"
              name="email"
              autoComplete="email"
              maxLength={254}
              placeholder="Email (Gmail)"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone_number"
              autoComplete="tel"
              maxLength={20}
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="username"
              autoComplete="username"
              maxLength={150}
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
              autoComplete="given-name"
              maxLength={150}
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              autoComplete="family-name"
              maxLength={150}
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
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirm_password"
              autoComplete="new-password"
              maxLength={128}
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row file-row">
            <label htmlFor="register-profile-picture">Profile picture (optional)</label>
            <input
              id="register-profile-picture"
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
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>
        {error && <p className="alert alert-error" role="alert">{error}</p>}
        {message && <p className="alert alert-success" role="status">{message}</p>}
        <p className="auth-link">
          Have an account? <Link to={ROUTES.LOGIN}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;