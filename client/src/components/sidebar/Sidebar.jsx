import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const hiddenPaths = ['/', '/register', '/login'];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  const handleLinkClick = () => {
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  const handleOverlayClick = () => {
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={handleOverlayClick}></div>}
      
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">Menu</h3>
          <button className="sidebar-close" onClick={toggleSidebar} aria-label="Close sidebar">
            ×
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <Link 
                to="/home" 
                onClick={handleLinkClick}
                className={`sidebar-link ${location.pathname === '/home' ? 'active' : ''}`}
              >
                <span className="sidebar-icon">🏠</span>
                <span className="sidebar-text">Home</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link 
                to="/projects" 
                onClick={handleLinkClick}
                className={`sidebar-link ${location.pathname === '/projects' ? 'active' : ''}`}
              >
                <span className="sidebar-icon">📁</span>
                <span className="sidebar-text">Projects</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link 
                to="/tasks" 
                onClick={handleLinkClick}
                className={`sidebar-link ${location.pathname === '/tasks' ? 'active' : ''}`}
              >
                <span className="sidebar-icon">✅</span>
                <span className="sidebar-text">Tasks</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link 
                to="/team" 
                onClick={handleLinkClick}
                className={`sidebar-link ${location.pathname === '/team' ? 'active' : ''}`}
              >
                <span className="sidebar-icon">👥</span>
                <span className="sidebar-text">Team</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link 
                to="/reports" 
                onClick={handleLinkClick}
                className={`sidebar-link ${location.pathname === '/reports' ? 'active' : ''}`}
              >
                <span className="sidebar-icon">📊</span>
                <span className="sidebar-text">Reports</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
