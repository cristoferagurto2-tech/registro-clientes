import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium', 
    large: 'logo-large'
  };

  return (
    <div className={`logo-container ${sizeClasses[size]}`}>
      <div className="logo-content">
        {/* Icono simple y profesional */}
        <div className="logo-icon">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="32" height="24" rx="4" fill="#1e3a8a"/>
            <rect x="8" y="12" width="24" height="4" rx="1" fill="#3b82f6"/>
            <rect x="8" y="18" width="18" height="3" rx="1" fill="#60a5fa"/>
            <rect x="8" y="23" width="14" height="3" rx="1" fill="#93c5fd"/>
          </svg>
        </div>
        
        {/* Texto */}
        <div className="logo-text">
          <span className="logo-client">Client</span>
          <span className="logo-code">Code</span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
