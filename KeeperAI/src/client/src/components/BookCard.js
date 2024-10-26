import React from 'react';
import StarRating from './StarRating';
import '../styles/BookCard.css';

const BookCard = ({ book, index, onDragStart, onDragEnd, isBeingDragged, onClick }) => {
  const handleDragStart = (e) => {
    onDragStart(e, { book, index });
  };

  return (
    <div 
      className={`book-card ${isBeingDragged ? 'dragging' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onClick(book)}
      data-index={index}
    >
      <img 
        src={book.cover || "/api/placeholder/192/288"} 
        alt={`Cover of ${book.title}`}
        className="book-cover"
      />
      <div className="book-overlay">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-rating">
          <StarRating 
            rating={Number(book.rating)} 
            size={16}
          />
        </div>
      </div>
    </div>
  );
};

export default BookCard;