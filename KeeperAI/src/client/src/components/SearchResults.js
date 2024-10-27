import React from 'react';
import { Search } from 'lucide-react';
import '../styles/SearchResults.css';

const SearchResults = ({ results, onResultClick, isLoading }) => {
  if (!results || (!isLoading && results.length === 0)) return null;

  return (
    <div className="search-results-container">
      {isLoading ? (
        <div className="search-loading">
          Searching...
        </div>
      ) : (
        results.map((shelf) => (
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
                    onClick={() => onResultClick(book, shelf.id)}
                    className="book-card-mini"
                  >
                    <img
                      src={book.cover || "/api/placeholder/80/120"}
                      alt={book.title}
                      className="book-cover-mini"
                    />
                    <div className="book-info-mini">
                      <p className="book-title-mini">
                        {book.title}
                      </p>
                      <p className="book-author-mini">
                        {book.author}
                      </p>
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
        ))
      )}
    </div>
  );
};

export default SearchResults;