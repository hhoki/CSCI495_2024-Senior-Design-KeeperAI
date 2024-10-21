import React, { useState, useEffect } from 'react';
import '../styles/VerticalNavbar.css';

const VerticalNavbar = ({ shelves, selectedShelf, onShelfSelect, onAddShelfClick }) => {
  const [expandedShelf, setExpandedShelf] = useState(null);

  useEffect(() => {
    console.log('VerticalNavbar - Selected shelf changed:', selectedShelf);
    if (selectedShelf) {
      setExpandedShelf(selectedShelf.id || selectedShelf.shelf_id);
      console.log('Expanding shelf:', selectedShelf.id || selectedShelf.shelf_id);
    }
  }, [selectedShelf]);

  const handleShelfClick = (shelf) => {
    console.log('Shelf clicked:', shelf);
    onShelfSelect(shelf.id || shelf.shelf_id);
  };

  console.log('VerticalNavbar - Rendering with shelves:', shelves);

  return (
    <nav className="side-navbar">
      <div className="shelf-buttons-container">
        {shelves.map((shelf) => (
          <div key={shelf.id || shelf.shelf_id} className="shelf-item">
            <button
              className={`shelf-button ${selectedShelf && (selectedShelf.id === shelf.id || selectedShelf.shelf_id === shelf.shelf_id) ? 'selected' : ''}`}
              onClick={() => handleShelfClick(shelf)}
            >
              {shelf.name}
            </button>
            <div className={`shelf-description ${expandedShelf === (shelf.id || shelf.shelf_id) ? 'expanded' : ''}`}>
              {shelf.description || 'No description'}
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