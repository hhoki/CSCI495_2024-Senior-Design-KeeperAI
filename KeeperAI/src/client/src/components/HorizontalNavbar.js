import React, { useState } from 'react';
import '../styles/HorizontalNavbar.css';

const HorizontalNavbar = ({ onAddBook }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/images/KeeperAI [Transparent].png" alt="Logo" className="logo" />
      </div>
      <div className="nav-center">
        <div className="search-bar">
          <img src="/images/icons/search.png" alt="Search" className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>
      <div className="nav-right">
        <img src="https://cdn1.iconfinder.com/data/icons/essentials-pack/96/user_account_profile_avatar_person-512.png" alt="Profile" className="profile-icon" />
        <div className="dropdown">
          <img 
            src="/images/icons/dropdown logo.png" 
            alt="Dropdown" 
            className="dropdown-icon" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
          />
          {isDropdownOpen && (
            <div className="dropdown-content">
              <a href="#library">Library</a>
              <a href="#recommendations">Recommendations</a>
              <a href="#analytics">Analytics</a>
              <a href="#contact">Contact</a>
              <a href="#settings">Settings</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HorizontalNavbar;