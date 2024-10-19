import React, { useState } from 'react';
import '../styles/AddShelfModal.css';

const AddShelfModal = ({ onClose, onAddShelf }) => {
    const [shelfName, setShelfName] = useState('');
    const [shelfDescription, setShelfDescription] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (shelfName.trim()) {
        onAddShelf({
          name: shelfName.trim(),
          description: shelfDescription.trim()
        });
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
              <button type="submit">Add Shelf</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default AddShelfModal;