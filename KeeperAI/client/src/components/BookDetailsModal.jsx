import React, { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';
import BookStateSelector from './BookStateSelector';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Pencil, X, Save, Trash2 } from 'lucide-react';
import { getImageUrl, handleImageError } from '../utils/imageUtils.js';
import '../styles/BookDetailsModal.css';

const BookDetailsModal = ({ book, onClose, onUpdateBook, onDeleteBook }) => {
  const [notes, setNotes] = useState(book.user_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [currentRating, setCurrentRating] = useState(Number(book.rating) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // State for editable fields
  const [editableFields, setEditableFields] = useState({
    title: book.title,
    author: book.author,
    description: book.description || '',
    published_date: book.published_date || '',
    isbn: book.isbn || '',
    publisher: book.publisher || '',
    page_count: book.page_count || '',
    cover: book.cover
  });

  const handleFieldChange = (field, value) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveNotes = async () => {
    try {
      setIsSubmitting(true);
      await axios.patch(`/api/book/${book.book_id}`, {
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
      const response = await axios.patch(`/api/book/${book.book_id}`, {
        rating: newRating
      });

      setCurrentRating(newRating);
      onUpdateBook && onUpdateBook({ ...book, rating: newRating });
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to update rating. Please try again.');
      setCurrentRating(book.rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStateChange = async (newStatus) => {
    try {
      setIsSubmitting(true);
      const response = await axios.patch(`/api/book/${book.book_id}`, {
        reading_status: newStatus
      });

      if (response.data) {
        onUpdateBook && onUpdateBook({ ...book, reading_status: newStatus });
      }
    } catch (error) {
      console.error('Error updating reading status:', error);
      alert('Failed to update reading status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('cover', file);

      console.log('Uploading cover for book:', book.book_id);

      const response = await axios.post(`/api/book/${book.book_id}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Cover upload response:', response.data);

      if (response.data.coverUrl) {
        // Update local state
        setEditableFields(prev => ({
          ...prev,
          cover: response.data.coverUrl
        }));

        // Update parent component
        onUpdateBook && onUpdateBook({
          ...book,
          cover: response.data.coverUrl
        });
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Failed to upload cover. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDetails = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.patch(`/api/book/${book.book_id}`, editableFields);

      onUpdateBook && onUpdateBook({ ...book, ...editableFields });
      setIsEditingDetails(false);
    } catch (error) {
      console.error('Error updating book details:', error);
      alert('Failed to save changes. Please try again.');
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
      await axios.delete(`/api/book/${book.book_id}`);
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
        <button className="book-details-close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="book-details-layout">
          <div className="book-details-left">
            <div className="cover-container">
              <img
                src={getImageUrl(book.cover, book.title)}
                alt={`Cover of ${book.title}`}
                className="book-details-cover"
                onError={(e) => handleImageError(e, book.title)}
              />
              {isEditingDetails && (
                <div className="cover-upload-overlay">
                  <label className="cover-upload-button" htmlFor="cover-upload">
                    Upload New Cover
                  </label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            <div className="book-details-rating-container">
              <div className="rating-wrapper">
                <StarRating
                  rating={currentRating}
                  size={24}
                  isEditable={!isSubmitting}
                  onRatingChange={handleRatingChange}
                  inModal={true}
                />
              </div>
            </div>
          </div>

          <div className="book-details-right">
            <div className="details-header">
              {!isEditingDetails ? (
                <>
                  <h2 className="book-details-title">{editableFields.title}</h2>
                  <button
                    className="edit-details-button"
                    onClick={() => setIsEditingDetails(true)}
                  >
                    <Pencil size={16} />
                    Edit Details
                  </button>
                </>
              ) : (
                <input
                  type="text"
                  value={editableFields.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="edit-title-input"
                  placeholder="Book Title"
                />
              )}
            </div>

            {book.genres && book.genres.length > 0 && (
              <div className="book-details-genres">
                {book.genres.map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="book-details-status-row">
              <BookStateSelector
                currentState={book.reading_status || 'unset'}
                onStateChange={handleStateChange}
                disabled={isSubmitting}
              />
              <span className="book-details-status-label">Reading Status</span>
            </div>

            <div className="book-details-info-section">
              {isEditingDetails ? (
                <>
                  <div className="edit-field">
                    <label>Author:</label>
                    <input
                      type="text"
                      value={editableFields.author}
                      onChange={(e) => handleFieldChange('author', e.target.value)}
                      placeholder="Author"
                    />
                  </div>

                  <div className="edit-field">
                    <label>Published Date:</label>
                    <input
                      type="text"
                      value={editableFields.published_date}
                      onChange={(e) => handleFieldChange('published_date', e.target.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>

                  <div className="edit-field">
                    <label>ISBN:</label>
                    <input
                      type="text"
                      value={editableFields.isbn}
                      onChange={(e) => handleFieldChange('isbn', e.target.value)}
                      placeholder="ISBN"
                    />
                  </div>

                  <div className="edit-field">
                    <label>Publisher:</label>
                    <input
                      type="text"
                      value={editableFields.publisher}
                      onChange={(e) => handleFieldChange('publisher', e.target.value)}
                      placeholder="Publisher"
                    />
                  </div>

                  <div className="edit-field">
                    <label>Page Count:</label>
                    <input
                      type="number"
                      value={editableFields.page_count}
                      onChange={(e) => handleFieldChange('page_count', e.target.value)}
                      placeholder="Page Count"
                    />
                  </div>

                  <div className="edit-field">
                    <label>Description:</label>
                    <textarea
                      value={editableFields.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Book description"
                      rows={5}
                    />
                  </div>

                  <div className="edit-actions">
                    <button
                      className="save-details-button"
                      onClick={handleSaveDetails}
                      disabled={isSubmitting}
                    >
                      <Save size={16} />
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="cancel-edit-button"
                      onClick={() => {
                        setIsEditingDetails(false);
                        setEditableFields({
                          title: book.title,
                          author: book.author,
                          description: book.description,
                          published_date: book.published_date,
                          isbn: book.isbn,
                          publisher: book.publisher || '',
                          page_count: book.page_count || '',
                          cover: book.cover
                        });
                      }}
                      disabled={isSubmitting}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="book-details-info-row">
                    <span className="book-details-info-label">Author:</span>
                    <span className="book-details-info-value">{editableFields.author}</span>
                  </div>
                  <div className="book-details-info-row">
                    <span className="book-details-info-label">Published:</span>
                    <span className="book-details-info-value">{editableFields.published_date}</span>
                  </div>
                  <div className="book-details-info-row">
                    <span className="book-details-info-label">ISBN:</span>
                    <span className="book-details-info-value">{editableFields.isbn}</span>
                  </div>
                  {editableFields.publisher && (
                    <div className="book-details-info-row">
                      <span className="book-details-info-label">Publisher:</span>
                      <span className="book-details-info-value">{editableFields.publisher}</span>
                    </div>
                  )}
                  {editableFields.page_count && (
                    <div className="book-details-info-row">
                      <span className="book-details-info-label">Pages:</span>
                      <span className="book-details-info-value">{editableFields.page_count}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isEditingDetails && (
              <div className="book-details-description-section">
                <h3 className="book-details-description-heading">Description</h3>
                <p>{editableFields.description}</p>
              </div>
            )}

            <div className="book-details-notes-section">
              <div className="book-details-notes-header">
                <h3>Notes</h3>
                {!isEditingNotes && (
                  <button
                    className="book-details-edit-button"
                    onClick={() => setIsEditingNotes(true)}
                    disabled={isSubmitting}
                  >
                    <Pencil size={16} />
                    Add Notes
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
                      <Save size={16} />
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
                      <X size={16} />
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
            <Trash2 size={16} />
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