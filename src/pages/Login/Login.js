import { useState } from "react";
import { login } from "../../api";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { LOGIN_ILLUSTRATION } from "../../assets";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      // Generic message: don't reveal whether the email has an account.
      setError(
        err.response
          ? "Invalid email or password."
          : "Unable to reach the server. Please try again."
      );
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="page-center login-page">
      <div className="login-card">
        <div className="login-illustration">
          <img src={LOGIN_ILLUSTRATION} alt="" className="login-image" />
        </div>

        <div className="login-container">
          <h1>Hello!<br />{getGreeting()}</h1>
          <h2>Log in to your account</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <p className="alert alert-error" role="alert">{error}</p>}

          <p className="auth-link">
            <Link to={ROUTES.FORGOT_PASSWORD}>Forgot Password?</Link>
          </p>
          <p className="auth-link">
            Don't have an account? <Link to={ROUTES.REGISTER}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
