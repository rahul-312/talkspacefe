import { useState } from "react";
import axios from "axios"; // Import Axios
import { API, apiConfig } from "../../api"; // Import API paths and config
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    setError(""); // Clear previous errors
    setLoading(true); // Start loading state

    // Prepare data for the API call
    const loginData = {
      email: formData.email,
      password: formData.password,
    };

    try {
      // Make the POST request to the login API using Axios with apiConfig
      const response = await axios.post(API.LOGIN, loginData, {
        timeout: apiConfig.timeout,
        headers: apiConfig.headers,
      });

      // Handle successful response
      if (response.data.tokens) {
        localStorage.setItem("access_token", response.data.tokens.access);
        localStorage.setItem("refresh_token", response.data.tokens.refresh);
        navigate("/dashboard"); // Redirect to dashboard
      }
    } catch (err) {
      // Handle error response
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className="error-msg">{error}</p>}
        <p className="signup-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        {/* Forgot Password Link */}
        <p className="forgot-password-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
