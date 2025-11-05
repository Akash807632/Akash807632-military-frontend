import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎖️ Military Asset Management
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Dashboard</Link>
          <Link to="/purchases" className="navbar-link">Purchases</Link>
          <Link to="/transfers" className="navbar-link">Transfers</Link>
          <Link to="/assignments" className="navbar-link">Assignments</Link>
        </div>

        <div className="navbar-user">
          <span className="user-info">
            {user?.username} ({user?.role})
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
