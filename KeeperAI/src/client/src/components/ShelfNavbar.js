import React, { useState } from 'react';
import AddBooksModal from './AddBooksModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import '../styles/ShelfNavbar.css';

const ShelfNavbar = ({ shelfName, onAddBook, onShelfSettings, onDeleteShelf }) => {
  const [isAddBooksModalOpen, setIsAddBooksModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleAddBook = () => {
    setIsAddBooksModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeleteShelf();
    setIsDeleteModalOpen(false);
  };

  return (
    <nav className="shelf-navbar">
      <div className="shelf-nav-left">
        <h2 className="shelf-name">{shelfName}</h2>
      </div>
      <div className="shelf-nav-right">
        <button onClick={handleAddBook} className="add-button">+</button>
        <img 
          src="/images/icons/bag cog.png" 
          alt="Settings" 
          className="settings-icon" 
          onClick={onShelfSettings}
        />
        <button onClick={handleDeleteClick} className="delete-shelf-button">
          <img src="/images/icons/trash.png" alt="Delete" className="delete-icon" />
        </button>
      </div>
      {isAddBooksModalOpen && (
        <AddBooksModal onClose={() => setIsAddBooksModalOpen(false)} />
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={shelfName}
      />
    </nav>
  );
};

export default ShelfNavbar;