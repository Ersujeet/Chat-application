import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiCheck,
  FiArrowRight,
  FiMessageCircle,
} from 'react-icons/fi';
import './../CSS files/Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/chat', { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail || !password) {
      setError('Please complete all fields to create your account.');
      return;
    }

    if (trimmedUsername.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        'https://backendapp-beige.vercel.app/api/auth/register',
        {
          username: trimmedUsername,
          email: trimmedEmail,
          password,
        }
      );

      setSuccess('Account created! Redirecting you to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try a different email or username.';
      setError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Create account">
        <div className="auth-aside">
          <div>
            <span className="auth-aside-badge">
              <FiMessageCircle aria-hidden="true" />
              Join PulseChat
            </span>
            <h2 className="auth-aside-title">
              Create your space in seconds.
            </h2>
            <p className="auth-aside-desc">
              Start group discussions, collaborate with teammates, and stay in
              sync from desktop or mobile.
            </p>
          </div>

          <ul className="auth-feature-list">
            <li className="auth-feature-item">
              <span className="auth-feature-dot" aria-hidden="true">
                <FiCheck />
              </span>
              Create unlimited topic &amp; team groups
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" aria-hidden="true">
                <FiCheck />
              </span>
              Clean, distraction-free message threads
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" aria-hidden="true">
                <FiCheck />
              </span>
              Seamless switching across screen sizes
            </li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h1>Create account</h1>
            <p>Fill in your details to get started</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <FiAlertCircle style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert auth-alert-success" role="status">
              <FiCheckCircle style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <div className="auth-field">
              <label htmlFor="username" className="auth-label">
                Username
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon" aria-hidden="true">
                  <FiUser />
                </span>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="auth-input"
                  placeholder="Alex Mercer"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email address
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon" aria-hidden="true">
                  <FiMail />
                </span>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon" aria-hidden="true">
                  <FiLock />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  className="auth-input"
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              className="auth-submit-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?
            <Link to="/login">Sign In</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;
