// SearchResults.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getImageUrl, handleImageError } from '../utils/imageUtils.js';
import '../styles/SearchResults.css';

const SearchResults = ({ results, onClose, isLoading }) => {
  const navigate = useNavigate();

  if (!results || (!isLoading && results.length === 0)) return null;

  const handleShelfClick = (shelf) => {
    // Use the same simple navigation approach as Home
    navigate(`/library?shelfId=${shelf.shelf_id}`);
    if (onClose) onClose();
  };

  return (
    <div className="search-results-container">
      {results.map((shelf) => (
        <div key={shelf.id} className="shelf-section">
          <div className="shelf-header">
            <h3 className="shelf-title">
              {shelf.name} ({shelf.books.length})
            </h3>
          </div>
          <div className="books-container">
            {shelf.books.length > 0 ? (
              shelf.books.map((book) => (
                <div
                  key={book.book_id}
                  onClick={() => handleShelfClick(shelf)}
                  className="book-card-mini"
                >
                  <img
                    src={getImageUrl(book.cover, book.title)}
                    alt={`Cover of ${book.title}`}
                    className="book-cover-mini"
                    onError={(e) => handleImageError(e, book.title)}
                  />
                  <div className="book-info-mini">
                    <p className="book-title-mini">{book.title}</p>
                    <p className="book-author-mini">{book.author}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-shelf-message">
                No books found in this shelf
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;