import React, { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import '../styles/BookDetailsModal.css';

const BookDetailsModal = ({ book, onClose, onUpdateBook, onDeleteBook}) => {
  const [notes, setNotes] = useState(book.user_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [currentRating, setCurrentRating] = useState(Number(book.rating) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveNotes = async () => {
    try {
      setIsSubmitting(true);
      await axios.patch(`http://localhost:5000/book/${book.book_id}`, {
        user_notes: notes
      });

      onUpdateBook && onUpdateBook({ ...book, user_notes: notes });
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = async (newRating) => {
    try {
      setIsSubmitting(true);
      
      // Log the request data for debugging
      console.log('Sending rating update:', {
        book_id: book.book_id,
        rating: newRating
      });

      const response = await axios.patch(`http://localhost:5000/book/${book.book_id}`, {
        book_id: book.book_id,
        rating: newRating
      });

      console.log('Update response:', response.data);
      setCurrentRating(newRating);
      onUpdateBook && onUpdateBook({ ...book, rating: newRating });
    } catch (error) {
      console.error('Error updating rating:', error.response?.data || error);
      alert('Failed to update rating. Please try again.');
      // Reset to previous rating on error
      setCurrentRating(book.rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsSubmitting(true);
      await axios.delete(`http://localhost:5000/book/${book.book_id}`);
      if (onDeleteBook) {
        onDeleteBook(book.book_id);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
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
              <StarRating 
                rating={currentRating}
                size={24}
                isEditable={!isSubmitting}
                onRatingChange={handleRatingChange}
              />
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
                {!isEditingNotes && (
                  <button 
                    className="book-details-edit-button" 
                    onClick={() => setIsEditingNotes(true)}
                    disabled={isSubmitting}
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="book-details-notes-edit">
                  <textarea
                    className="book-details-notes-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes about this book..."
                    disabled={isSubmitting}
                  />
                  <div className="book-details-notes-actions">
                    <button 
                      className="book-details-save-button" 
                      onClick={handleSaveNotes}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      className="book-details-cancel-button"
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNotes(book.user_notes || '');
                      }}
                      disabled={isSubmitting}
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
        <div className="book-details-actions">
        <button 
          className="book-details-delete-button"
          onClick={handleDeleteClick}
          disabled={isSubmitting}
        >
          Delete Book
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        itemName={book.title}
        itemType="book"
      />

      </div>
    </div>
  );
};

export default BookDetailsModal;