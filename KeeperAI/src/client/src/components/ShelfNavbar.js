import React, { useState } from 'react';
import AddBooksModal from './AddBooksModal';
import ShelfSettingsModal from './ShelfSettingsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import '../styles/ShelfNavbar.css';

const ShelfNavbar = ({ shelf, onAddBook, onShelfUpdate, onDeleteShelf }) => {
  const [isAddBooksModalOpen, setIsAddBooksModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleAddBook = () => {
    setIsAddBooksModalOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeleteShelf(shelf.id);
    setIsDeleteModalOpen(false);
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
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={shelf.name}
      />
    </nav>
  );
};

export default ShelfNavbar;