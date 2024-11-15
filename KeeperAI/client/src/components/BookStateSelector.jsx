import React from 'react';
import { 
  HelpCircle, 
  CheckCircle, 
  PauseCircle, 
  PlayCircle, 
  Star, 
  XCircle 
} from 'lucide-react';
import '../styles/BookStateSelector.css';

export const ReadingStatus = {
  UNSET: 'unset',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  READING: 'reading',
  FAVORITE: 'favorite',
  DROPPED: 'dropped'
};

const states = [
  { id: ReadingStatus.UNSET, icon: HelpCircle, color: '#868686' },
  { id: ReadingStatus.COMPLETED, icon: CheckCircle, color: '#4CAF50' },
  { id: ReadingStatus.PAUSED, icon: PauseCircle, color: '#FFA726' },
  { id: ReadingStatus.READING, icon: PlayCircle, color: '#2196F3' },
  { id: ReadingStatus.FAVORITE, icon: Star, color: '#FFD700' },
  { id: ReadingStatus.DROPPED, icon: XCircle, color: '#F44336' }
];

const BookStateSelector = ({ currentState = ReadingStatus.UNSET, onStateChange, disabled }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    
    const currentIndex = states.findIndex(state => state.id === currentState);
    const nextIndex = (currentIndex + 1) % states.length;
    
    const element = e.currentTarget;
    element.classList.add('state-change');
    
    setTimeout(() => {
      element.classList.remove('state-change');
    }, 400); // Match animation duration
    
    onStateChange(states[nextIndex].id);
  };

  const CurrentStateIcon = states.find(state => state.id === currentState)?.icon || states[0].icon;

  return (
    <div 
      className={`book-state-selector ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      data-state={currentState}
    >
      <CurrentStateIcon 
        size={20}
        color={states.find(state => state.id === currentState)?.color || states[0].color}
        strokeWidth={2.5}
      />
    </div>
  );
};

export default BookStateSelector;