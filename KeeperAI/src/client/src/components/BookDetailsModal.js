import React, { useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import '../styles/BookDetailsModal.css';

const BookDetailsModal = ({ book, onClose, onUpdateNotes }) => {
  const [notes, setNotes] = useState(book.user_notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveNotes = async () => {
    try {
      await axios.patch(`http://localhost:5000/book/${book.book_id}`, {
        user_notes: notes
      });
  
      onUpdateNotes && onUpdateNotes(book.book_id, notes);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  return (
    <div className="book-details-modal-backdrop" onClick={onClose}>
      <div className="book-details-modal-content" onClick={e => e.stopPropagation()}>
        <button className="book-details-close-button" onClick={onClose}>&times;</button>
        <div className="book-details-layout">
          <div className="book-details-left">
            <img 
              src={book.cover || "/api/placeholder/300/450"} 
              alt={`Cover of ${book.title}`} 
              className="book-details-cover"
            />
            <div className="book-details-rating-container">
              <div className="book-details-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    fill={i < book.rating ? "gold" : "none"}
                    color={i < book.rating ? "gold" : "gray"}
                  />
                ))}
              </div>
              <span className="book-details-rating-text">({book.rating}/5)</span>
            </div>
          </div>

          <div className="book-details-right">
            <h2 className="book-details-title">{book.title}</h2>
            
            <div className="book-details-info-section">
              <div className="book-details-info-row">
                <span className="book-details-info-label">Author:</span>
                <span className="book-details-info-value">{book.author}</span>
              </div>
              <div className="book-details-info-row">
                <span className="book-details-info-label">Published:</span>
                <span className="book-details-info-value">{book.published_date}</span>
              </div>
              <div className="book-details-info-row">
                <span className="book-details-info-label">ISBN:</span>
                <span className="book-details-info-value">{book.isbn}</span>
              </div>
              <div className="book-details-info-row">
                <span className="book-details-info-label">Genre:</span>
                <span className="book-details-info-value">{book.genre || 'N/A'}</span>
              </div>
              <div className="book-details-info-row">
                <span className="book-details-info-label">Shelf Location:</span>
                <span className="book-details-info-value">{book.shelf_location}</span>
              </div>
            </div>

            <div className="book-details-description-section">
              <h3 className="book-details-description-heading">Description</h3>
              <p>{book.description}</p>
            </div>

            <div className="book-details-notes-section">
              <div className="book-details-notes-header">
                <h3>Notes</h3>
                {!isEditing && (
                  <button className="book-details-edit-button" onClick={() => setIsEditing(true)}>
                    Edit
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="book-details-notes-edit">
                  <textarea
                    className="book-details-notes-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes about this book..."
                  />
                  <div className="book-details-notes-actions">
                    <button className="book-details-save-button" onClick={handleSaveNotes}>Save</button>
                    <button 
                      className="book-details-cancel-button" 
                      onClick={() => {
                        setIsEditing(false);
                        setNotes(book.user_notes || '');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p>{notes || 'No notes added yet.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;