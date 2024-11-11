import React from 'react';
import axios from 'axios';
import { Check } from 'lucide-react';
import StarRating from './StarRating';
import BookStateSelector from './BookStateSelector';
import { getImageUrl, handleImageError } from '../utils/imageUtils.js';
import '../styles/BookCard.css';

const BookCard = ({
  book,
  selected,
  onSelect,
  onClick,
  onUpdateBook,
  isHighlighted,
  index,
  onDragStart,
  onDragEnd,
  isBeingDragged
}) => {

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ book, index }));
    if (onDragStart) {
      onDragStart(e, { book, index });
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const handleClick = (e) => {
    onClick(book);
  };

  const handleStateChange = async (newStatus) => {
    try {
      const response = await axios.patch(`/api/book/${book.book_id}`, {
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
      className={`book-card ${selected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${isBeingDragged ? 'dragging' : ''}`}
      onClick={handleClick}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-index={index}
    >
      <div
        className="selection-overlay"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <div className="selection-checkbox">
          {selected && <Check size={16} color="white" />}
        </div>
      </div>

      <img
        src={getImageUrl(book.cover, book.title)}
        alt={`Cover of ${book.title}`}
        className="book-cover"
        onError={(e) => handleImageError(e, book.title)}
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