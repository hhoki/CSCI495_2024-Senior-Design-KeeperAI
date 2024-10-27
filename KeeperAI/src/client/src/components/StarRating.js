import React, { useState } from 'react';
import '../styles/StarRating.css';

const StarRating = ({ rating, size = 24, className = '', isEditable = false, onRatingChange, inModal = false }) => {
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [inputValue, setInputValue] = useState(rating);

  const getPercentage = (starPosition) => {
    const percentage = Math.max(0, Math.min(100, (rating - starPosition) * 100));
    return percentage;
  };

  const handleStarClick = () => {
    if (isEditable && !isEditingRating) {
      setIsEditingRating(true);
      setInputValue(rating);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && value >= 0 && value <= 5)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    const newRating = Math.min(5, Math.max(0, parseFloat(inputValue) || 0));
    if (newRating !== rating) {
      onRatingChange(newRating);
    }
    setIsEditingRating(false);
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className={`star-rating ${className} ${isEditable ? 'editable' : ''}`}>
      <div className="stars-container" onClick={handleStarClick}>
        {[...Array(5)].map((_, index) => {
          const percentage = getPercentage(index);
          const uniqueId = `star-gradient-${index}-${Math.random()}`;

          return (
            <div 
              key={index} 
              style={{ width: size, height: size }} 
              className="star-container"
            >
              <svg
                viewBox="0 0 24 24"
                width={size}
                height={size}
                style={{ cursor: isEditable ? 'pointer' : 'default' }}
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#d1d1d1"
                  stroke="#b0b0b0"
                  strokeWidth="0.5"
                />
                
                <defs>
                  <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset={`${percentage}%`} stopColor="#ffd700" />
                    <stop offset={`${percentage}%`} stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={`url(#${uniqueId})`}
                  stroke="#ffd700"
                  strokeWidth="0.75"
                />
              </svg>
            </div>
          );
        })}
      </div>
      <div className="rating-text">
        {isEditingRating ? (
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleInputKeyPress}
            min="0"
            max="5"
            step="0.1"
            className="rating-input"
            autoFocus
          />
        ) : (
          <span className={`rating-value ${inModal ? 'in-modal' : ''}`}>
            ({Number(rating).toFixed(1)})
          </span>
        )}
      </div>
    </div>
  );
};

export default StarRating;