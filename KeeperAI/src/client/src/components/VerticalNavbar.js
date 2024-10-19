import React, { useState } from 'react';
import '../styles/VerticalNavbar.css';

const VerticalNavbar = ({ shelves, selectedShelf, onShelfSelect, onAddShelfClick }) => {
  const [expandedShelf, setExpandedShelf] = useState(null);

  const toggleShelf = (shelfId) => {
    if (expandedShelf === shelfId) {
      setExpandedShelf(null);
    } else {
      setExpandedShelf(shelfId);
    }
  };

  return (
    <nav className="side-navbar">
      <div className="shelf-buttons-container">
        {shelves.map((shelf) => (
          <div key={shelf.id} className="shelf-item">
            <button
              className={`shelf-button ${selectedShelf && selectedShelf.id === shelf.id ? 'selected' : ''}`}
              onClick={() => {
                onShelfSelect(shelf.id);
                toggleShelf(shelf.id);
              }}
            >
              {shelf.name}
            </button>
            <div className={`shelf-description ${expandedShelf === shelf.id ? 'expanded' : ''}`}>
              {shelf.description}
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