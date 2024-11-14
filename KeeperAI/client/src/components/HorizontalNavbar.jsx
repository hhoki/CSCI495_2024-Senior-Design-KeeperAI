import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UsersRound, Menu } from 'lucide-react';
import SearchResults from './SearchResults';
import Tooltip from './Tooltip';
import '../styles/HorizontalNavbar.css';
import api from '../axiosConfig';

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
      setShowResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await api.get(`/book/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data.results);
      setShowResults(true);
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
    }, 300);
  };

  // Clear search and close results
  const handleCloseSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle clicks outside search results
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="keeper-top-navbar">
      <div className="keeper-nav-left">
        <Tooltip text="Home">
          <Link to="/" className="logo-link">
            <img src="/images/K [KeeperAI].png" alt="Logo" className="keeper-logo" />
          </Link>
        </Tooltip>
      </div>

      <div className="keeper-nav-center" ref={searchContainerRef}>
        <div className="keeper-search-bar">
          <Search className="keeper-search-icon" size={16} color="#ffffff" />
          <input
            type="text"
            placeholder="Search..."
            className="keeper-search-input"
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
            onClose={handleCloseSearch}
            isLoading={isSearching}
          />
        )}
      </div>

      <div className="keeper-nav-right">
        <Tooltip text="Profile">
          <button className="keeper-profile-button">
            <UsersRound size={60} strokeWidth={2.5} />
          </button>
        </Tooltip>
        <button
          className="keeper-dropdown-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Menu size={60} strokeWidth={3.2} />
        </button>
        {isDropdownOpen && (
          <div className="keeper-dropdown-content">
            <a href="#library">Library</a>
            <a href="#recommendations">Recommendations</a>
            <a href="#analytics">Analytics</a>
            <a href="#contact">Contact</a>
            <a href="#settings">Settings</a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HorizontalNavbar;