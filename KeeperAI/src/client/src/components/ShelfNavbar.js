import React, { useState } from 'react';
import AddBooksModal from './AddBooksModal';
import ShelfSettingsModal from './ShelfSettingsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Tooltip from './Tooltip';
import '../styles/ShelfNavbar.css';

const ShelfNavbar = ({ shelf, onAddBook, onShelfUpdate, onDeleteShelf }) => {
  const [isAddBooksModalOpen, setIsAddBooksModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBooksAdded = (newBooks) => {
    if (onAddBook) {
      onAddBook(newBooks);
    }
    setIsAddBooksModalOpen(false);
  };

  // Make sure we're using the correct shelf ID property
  const shelfId = shelf.shelf_id || shelf.id;

  return (
    <nav className="shelf-navbar">
      <div className="shelf-nav-left">
        <h2 className="shelf-name">{shelf.name || shelf.shelf_name}</h2>
      </div>
      <div className="shelf-nav-right">
        <Tooltip text="Add Books">
          <button onClick={() => setIsAddBooksModalOpen(true)} className="add-button">
            +
          </button>
        </Tooltip>

        <Tooltip text="Shelf Settings">
          <img
            src="/images/icons/bag cog.png"
            alt="Settings"
            className="settings-icon"
            onClick={() => setIsSettingsModalOpen(true)}
          />
        </Tooltip>

        <Tooltip text="Delete Shelf">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="delete-shelf-button"
          >
            <img
              src="/images/icons/trash.png"
              alt="Delete"
              className="delete-icon"
            />
          </button>
        </Tooltip>
      </div>

      {isAddBooksModalOpen && (
        <AddBooksModal
          onClose={() => setIsAddBooksModalOpen(false)}
          shelfId={shelf.shelf_id}
          onBooksAdded={handleBooksAdded} // Pass the handler to the modal
        />
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
          onDeleteShelf(shelfId);
          setShowDeleteConfirm(false);
        }}
        itemName={shelf.name || shelf.shelf_name}
        itemType="shelf"
      />
    </nav>
  );
};

export default ShelfNavbar;