import React from 'react';
import { Star } from 'lucide-react';
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
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < book.rating ? "yellow" : "none"}
              color={i < book.rating ? "yellow" : "white"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookCard;