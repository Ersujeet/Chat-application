import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheck,
  FiArrowRight,
  FiMessageCircle,
} from 'react-icons/fi';
import './../CSS files/Auth.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/chat', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        'https://backendapp-beige.vercel.app/api/auth/login',
        {
          email: trimmedEmail,
          password,
        }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isLogin', 'true');
      localStorage.setItem('userid', res.data.userId);

      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate('/chat');
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to sign in. Please check your credentials and try again.';
      setError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Sign in">
        <div className="auth-aside">
          <div>
            <span className="auth-aside-badge">
              <FiMessageCircle aria-hidden="true" />
              PulseChat Workspace
            </span>
            <h2 className="auth-aside-title">
              Conversations that feel effortless.
            </h2>
            <p className="auth-aside-desc">
              Jump back into your group channels, share ideas instantly, and
              stay connected across every device.
            </p>
          </div>

          <ul className="auth-feature-list">
            <li className="auth-feature-item">
              <span className="auth-feature-dot" aria-hidden="true">
                <FiCheck />
              </span>
              Instant group messaging & room search
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" aria-hidden="true">
                <FiCheck />
              </span>
              Responsive desktop & mobile experience
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" aria-hidden="true">
                <FiCheck />
              </span>
              Dark & light themes built for comfort
            </li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in with your account to continue</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <FiAlertCircle style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin} noValidate>
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account?
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
