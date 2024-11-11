import React from 'react';
import '../styles/DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, itemType = 'item' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete the {itemType} "{itemName}"?</p>
        <p className="warning-text">This action cannot be undone.</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="delete-button">Delete</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;