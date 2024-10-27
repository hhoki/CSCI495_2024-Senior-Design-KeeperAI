import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import SearchResults from './SearchResults';
import '../styles/HorizontalNavbar.css';

const HorizontalNavbar = ({ onBookSelect, onShelfSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(`http://localhost:5000/book/search?query=${encodeURIComponent(query)}`);
        setSearchResults(response.data.results);
      } catch (error) {
        console.error('Error searching books:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleResultClick = (book, shelfId) => {
    // Navigate to shelf
    onShelfSelect(shelfId);
    
    // After a short delay to allow shelf content to load, open book details
    setTimeout(() => {
      onBookSelect(book);
    }, 100);
    
    // Clear search
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/images/K [KeeperAI].png" alt="Logo" className="logo" />
      </div>
      <div className="nav-center" ref={searchContainerRef}>
        <div className="search-bar">
          <Search className="search-icon" size={16} color="#ffffff" />
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <SearchResults
          results={searchResults}
          onResultClick={handleResultClick}
          isLoading={isSearching}
        />
      </div>
      <div className="nav-right">
        <img
          src="https://cdn1.iconfinder.com/data/icons/essentials-pack/96/user_account_profile_avatar_person-512.png"
          alt="Profile"
          className="profile-icon"
        />
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