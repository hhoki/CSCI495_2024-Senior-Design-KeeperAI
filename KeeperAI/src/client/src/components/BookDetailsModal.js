import React from 'react';
import { Star } from 'lucide-react';
import '../styles/BookDetailsModal.css';

const BookDetailsModal = ({ book, onClose }) => {
    if (!book) return null;
  
    return (
      <div className="book-modal-backdrop" onClick={onClose}>
        <div className="book-modal-content" onClick={e => e.stopPropagation()}>
          <button className="book-modal-close-button" onClick={onClose}>&times;</button>
          <div className="book-modal-details">
            <img src={book.cover || "/api/placeholder/300/450"} alt={`Cover of ${book.title}`} className="book-modal-cover" />
            <div className="book-modal-info">
              <h2>{book.title}</h2>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Rating:</strong> 
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    fill={i < book.rating ? "gold" : "none"}
                    color={i < book.rating ? "gold" : "gray"}
                  />
                ))}
                ({book.rating}/5)
              </p>
              <p><strong>Shelf:</strong> {book.shelfId}</p>
              <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
              <p><strong>Published Date:</strong> {book.publishedDate || 'N/A'}</p>
              <p><strong>Genre:</strong> {book.genre || 'N/A'}</p>
              <p><strong>Pages:</strong> {book.pages || 'N/A'}</p>
            </div>
          </div>
          <div className="book-modal-description">
            <h3>Description</h3>
            <p>{book.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default BookDetailsModal;