import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import SearchResults from './SearchResults';
import axios from 'axios';
import '../styles/HorizontalNavbar.css';

const HorizontalNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`http://localhost:5000/book/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Show results container immediately when typing starts
    if (query.trim()) {
      setShowResults(true);
    }

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms delay
  };

  const handleResultClick = (book, shelfId) => {
    navigate(`/library?shelfId=${shelfId}`);
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  // Clear search on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img src="/images/K [KeeperAI].png" alt="Logo" className="logo" />
        </Link>
      </div>
      <div className="nav-center">
        <div className="search-bar">
          <Search className="search-icon" size={16} color="#ffffff" />
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => {
              if (searchQuery.trim()) {
                setShowResults(true);
              }
            }}
          />
        </div>
        {showResults && (
          <SearchResults
            results={searchResults}
            onResultClick={handleResultClick}
            isLoading={isSearching}
          />
        )}
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