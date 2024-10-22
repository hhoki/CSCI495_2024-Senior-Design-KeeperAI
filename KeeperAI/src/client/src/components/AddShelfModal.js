import React, { useState } from 'react';
import '../styles/AddShelfModal.css';

const AddShelfModal = ({ onClose, onAddShelf }) => {
  const [shelfName, setShelfName] = useState('');
  const [shelfDescription, setShelfDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await onAddShelf({
        name: shelfName.trim(),
        description: shelfDescription.trim()
      });
      onClose();
    } catch (error) {
      console.error('Error adding shelf:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add New Shelf</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="shelfName">Shelf Name:</label>
            <input
              type="text"
              id="shelfName"
              value={shelfName}
              onChange={(e) => setShelfName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="shelfDescription">Description:</label>
            <textarea
              id="shelfDescription"
              value={shelfDescription}
              onChange={(e) => setShelfDescription(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Shelf'}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShelfModal;