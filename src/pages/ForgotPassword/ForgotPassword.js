import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

const BASE_URL = 'http://127.0.0.1:8000/';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true); // Disable button on submit

    try {
      const res = await axios.post(`${BASE_URL}users/forgot-password/`, { email });
      setMessage(res.data.detail);
    } catch (err) {
      setError(err.response?.data?.email || 'Something went wrong.');
    } finally {
      setLoading(false); // Re-enable button after request finishes
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
