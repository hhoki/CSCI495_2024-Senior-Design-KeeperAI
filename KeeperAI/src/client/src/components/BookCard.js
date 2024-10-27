import React from 'react';
import axios from 'axios';
import StarRating from './StarRating';
import BookStateSelector from './BookStateSelector';
import '../styles/BookCard.css';

const BookCard = ({ 
  book, 
  index, 
  onDragStart, 
  onDragEnd, 
  isBeingDragged, 
  onClick,
  onUpdateBook,
  isHighlighted // New prop
}) => {
  const handleDragStart = (e) => {
    onDragStart(e, { book, index });
  };

  const handleStateChange = async (newStatus) => {
    try {
      console.log('Updating reading status:', newStatus);
      const response = await axios.patch(`http://localhost:5000/book/${book.book_id}`, {
        reading_status: newStatus
      });

      if (response.data && onUpdateBook) {
        onUpdateBook({ ...book, reading_status: newStatus });
      }
    } catch (error) {
      console.error('Error updating reading status:', error);
    }
  };

  return (
    <div 
      className={`book-card ${isBeingDragged ? 'dragging' : ''} ${isHighlighted ? 'highlighted' : ''}`}
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
      <div className="book-state-container">
        <BookStateSelector
          currentState={book.reading_status || 'unset'}
          onStateChange={handleStateChange}
        />
      </div>
      <div className="book-overlay">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-rating">
          <StarRating rating={Number(book.rating)} size={16} />
        </div>
      </div>
    </div>
  );
};

export default BookCard;