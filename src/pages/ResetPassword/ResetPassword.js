import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword, errorMessage } from '../../api';
import { validatePassword } from '../../utils/validation';
import { ROUTES } from '../../routes';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const redirectTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setMessage('Password reset successful. Redirecting to login...');
      redirectTimer.current = setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
    } catch (err) {
      setError(errorMessage(err, 'This reset link is invalid or has expired.'));
    } finally {
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card auth-card">
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            maxLength={128}
            required
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {message && <p className="alert alert-success" role="status">{message}</p>}
        {error && <p className="alert alert-error" role="alert">{error}</p>}
        <p className="auth-link">
          Link expired? <Link to={ROUTES.FORGOT_PASSWORD}>Request a new one</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
