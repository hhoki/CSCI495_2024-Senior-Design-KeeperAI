import React, { useState } from 'react';
import AddBooksModal from './AddBooksModal';
import '../styles/ShelfNavbar.css';

const ShelfNavbar = ({ shelfName, onAddBook, onShelfSettings }) => {
  const [isAddBooksModalOpen, setIsAddBooksModalOpen] = useState(false);

  const handleAddBook = () => {
    setIsAddBooksModalOpen(true);
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
      </div>
      {isAddBooksModalOpen && (
        <AddBooksModal onClose={() => setIsAddBooksModalOpen(false)} />
      )}
    </nav>
  );
};

export default ShelfNavbar;