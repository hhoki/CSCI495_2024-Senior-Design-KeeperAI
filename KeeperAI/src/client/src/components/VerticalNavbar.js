import React, { useState, useEffect } from 'react';
import '../styles/VerticalNavbar.css';

const VerticalNavbar = ({ shelves, selectedShelf, onShelfSelect, onAddShelfClick }) => {
  console.log('VerticalNavbar - Current shelves:', shelves);
  console.log('VerticalNavbar - Selected shelf:', selectedShelf);

  const handleShelfClick = (shelf) => {
    console.log('Shelf clicked:', shelf);
    onShelfSelect(shelf.shelf_id || shelf.id);
  };

  return (
    <nav className="side-navbar">
      <div className="shelf-buttons-container">
        {shelves.map((shelf) => (
          <div key={shelf.shelf_id || shelf.id} className="shelf-item">
            <button
              className={`shelf-button ${
                selectedShelf && 
                (selectedShelf.shelf_id === shelf.shelf_id || selectedShelf.id === shelf.id) 
                  ? 'selected' 
                  : ''
              }`}
              onClick={() => handleShelfClick(shelf)}
            >
              {shelf.name || shelf.shelf_name}
            </button>
            <div className={`shelf-description ${
              selectedShelf && 
              (selectedShelf.shelf_id === shelf.shelf_id || selectedShelf.id === shelf.id) 
                ? 'expanded' 
                : ''
            }`}>
              {shelf.description || shelf.shelf_description || 'No description'}
            </div>
          </div>
        ))}
        <div className="shelf-item">
          <button onClick={onAddShelfClick} className="shelf-button add-shelf-button">
            + Add Shelf
          </button>
        </div>
      </div>
    </nav>
  );
};

export default VerticalNavbar;