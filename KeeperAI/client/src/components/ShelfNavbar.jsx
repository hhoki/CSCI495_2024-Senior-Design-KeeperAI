import React, { useState } from 'react';
import { Plus, Settings, Trash2, List, BookOpen } from 'lucide-react';
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

  return (
    <nav className="shelf-navbar">
      <div className="shelf-nav-left">
        <BookOpen className="shelf-icon" size={24} />
        <h2 className="shelf-name">{shelf.name || shelf.shelf_name}</h2>
      </div>

      <div className="shelf-nav-right">
        <Tooltip text="Add Books">
          <button
            onClick={() => setIsAddBooksModalOpen(true)}
            className="icon-button"
          >
            <Plus size={24} />
          </button>
        </Tooltip>

        <Tooltip text="Shelf Settings">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="icon-button"
          >
            <Settings size={22} />
          </button>
        </Tooltip>

        <Tooltip text="Delete Shelf">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="icon-button delete"
          >
            <Trash2 size={22} />
          </button>
        </Tooltip>
      </div>

      {isAddBooksModalOpen && (
        <AddBooksModal
          onClose={() => setIsAddBooksModalOpen(false)}
          shelfId={shelf.shelf_id}
          onBooksAdded={handleBooksAdded}
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
          onDeleteShelf(shelf.id || shelf.shelf_id);
          setShowDeleteConfirm(false);
        }}
        itemName={shelf.name || shelf.shelf_name}
        itemType="shelf"
      />
    </nav>
  );
};

export default ShelfNavbar;