import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api';
import { ROUTES } from '../../routes';

// Shown for every accepted request so the form can't be used to probe which
// emails have accounts.
const GENERIC_SUCCESS =
  'If an account exists for that email, a password reset link has been sent.';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setMessage(GENERIC_SUCCESS);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (status && status < 500) {
        // e.g. "no user with this email": answer the same as success
        setMessage(GENERIC_SUCCESS);
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card auth-card">
        <h1>Forgot Password</h1>
        <p className="muted auth-hint">Enter your email and we'll send you a reset link.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            maxLength={254}
            required
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {message && <p className="alert alert-success" role="status">{message}</p>}
        {error && <p className="alert alert-error" role="alert">{error}</p>}
        <p className="auth-link">
          Remembered it? <Link to={ROUTES.LOGIN}>Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
