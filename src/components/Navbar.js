import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiMessageSquare,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import './../CSS files/Navbar.css';

const Navbar = ({ isLoggedIn, onLogout, theme, onToggleTheme }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('isLogin');
      localStorage.removeItem('token');
      localStorage.removeItem('userid');
      localStorage.removeItem('selectedgroup');
    }
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <nav className="navbar-inner" aria-label="Main navigation">
        <Link to={isLoggedIn ? '/chat' : '/login'} className="navbar-brand">
          <span className="navbar-brand-icon" aria-hidden="true">
            <FiMessageSquare />
          </span>
          <span className="navbar-brand-text">PulseChat</span>
        </Link>

        <div className="navbar-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            title={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>

          <ul className="nav-links-list">
            {!isLoggedIn ? (
              <>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `nav-link-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <FiLogIn aria-hidden="true" />
                    <span>Sign In</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `nav-link-item nav-link-primary ${isActive ? 'active' : ''}`
                    }
                  >
                    <FiUserPlus aria-hidden="true" />
                    <span>Sign Up</span>
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/chat"
                    className={({ isActive }) =>
                      `nav-link-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <FiMessageSquare aria-hidden="true" />
                    <span className="nav-label-hide-xs">Chats</span>
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="nav-logout-btn"
                    onClick={handleLogout}
                  >
                    <FiLogOut aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
