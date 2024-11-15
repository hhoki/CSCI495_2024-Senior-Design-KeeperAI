import React, { useState } from 'react';
import '../styles/Tooltip.css';

const Tooltip = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="tooltip">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;