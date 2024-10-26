import React, { useState } from 'react';
import AddBooksModal from './AddBooksModal';
import ShelfSettingsModal from './ShelfSettingsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import '../styles/ShelfNavbar.css';

const ShelfNavbar = ({ shelf, onAddBook, onShelfUpdate, onDeleteShelf }) => {
  const [isAddBooksModalOpen, setIsAddBooksModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddBook = () => {
    setIsAddBooksModalOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <nav className="shelf-navbar">
      <div className="shelf-nav-left">
        <h2 className="shelf-name">{shelf.name}</h2>
      </div>
      <div className="shelf-nav-right">
        <button onClick={handleAddBook} className="add-button">+</button>
        <img 
          src="/images/icons/bag cog.png" 
          alt="Settings" 
          className="settings-icon" 
          onClick={handleSettingsClick}
        />
        <button onClick={handleDeleteClick} className="delete-shelf-button">
          <img src="/images/icons/trash.png" alt="Delete" className="delete-icon" />
        </button>
      </div>
      {isAddBooksModalOpen && (
        <AddBooksModal onClose={() => setIsAddBooksModalOpen(false)} />
      )}
      {isSettingsModalOpen && (
        <ShelfSettingsModal
          shelf={shelf}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={onShelfUpdate}
        />
      )}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDeleteShelf(shelf.id);
          setShowDeleteConfirm(false);
        }}
        itemName={shelf.name}
        itemType="shelf"
      />
    </nav>
  );
};

export default ShelfNavbar;