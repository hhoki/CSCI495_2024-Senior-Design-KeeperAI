import React, { useState, useEffect } from 'react';
import '../styles/ShelfSettingsModal.css';

const ShelfSettingsModal = ({ shelf, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    console.log('ShelfSettingsModal received shelf:', shelf);
    if (shelf) {
      setName(shelf.name || '');
      setDescription(shelf.description || '');
    }
  }, [shelf]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shelf || !shelf.id) {
      console.error('Invalid shelf data in ShelfSettingsModal:', shelf);
      return;
    }
    const updatedShelf = {
      id: shelf.id,
      name,
      description
    };
    console.log('ShelfSettingsModal saving updated shelf:', updatedShelf);
    onSave(updatedShelf);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Shelf</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="shelfName">Shelf Name:</label>
            <input
              type="text"
              id="shelfName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="shelfDescription">Description:</label>
            <textarea
              id="shelfDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShelfSettingsModal;