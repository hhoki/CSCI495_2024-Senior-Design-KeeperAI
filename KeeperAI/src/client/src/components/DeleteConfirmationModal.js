import React from 'react';
import '../styles/DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete the shelf "{itemName}"? This action cannot be undone. All books from this shelf will be removed.</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="delete-shelf-button">Delete</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;