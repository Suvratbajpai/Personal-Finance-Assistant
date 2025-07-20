import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          💰 Personal Finance Assistant
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {user ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/transactions')}`} to="/transactions">
                    Transactions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/add-transaction')}`} to="/add-transaction">
                    Add Transaction
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/analytics')}`} to="/analytics">
                    Analytics
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/receipt-upload')}`} to="/receipt-upload">
                    Receipt Upload
                  </Link>
                </li>
              </ul>
              
              <ul className="navbar-nav">
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    👤 {user.username}
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/login')}`} to="/login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/register')}`} to="/register">
                  Register
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;