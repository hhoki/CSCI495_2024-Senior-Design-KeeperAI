import React, { useState, useRef, useCallback } from 'react';


const MoveToShelfModal = ({ isOpen, onClose, shelves, selectedShelf, onMove, selectedBooks, singleBook }) => {
    const [targetShelf, setTargetShelf] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter out current shelf and get actual book counts
    const availableShelves = shelves
        .filter(shelf => shelf.id !== selectedShelf?.id || shelf.shelf_id !== selectedShelf?.shelf_id)
        .map(shelf => ({
            ...shelf,
            bookCount: shelf.book_count || shelf.books?.length || 0
        }));

    const handleMove = async (shelf) => {
        if (!shelf) return;
        setIsSubmitting(true);
        try {
            await onMove(shelf);
        } catch (error) {
            console.error('Error moving books:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const getModalTitle = () => {
        if (singleBook) {
            return `Add "${singleBook.title}" to Shelf`;
        }
        return "Move to Shelf";
    };

    const getButtonText = () => {
        if (isSubmitting) {
            return singleBook ? 'Adding...' : 'Moving...';
        }
        if (singleBook) {
            return 'Add to Shelf';
        }
        return `Move ${selectedBooks.length} ${selectedBooks.length === 1 ? 'book' : 'books'}`;
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content move-to-shelf-modal" onClick={e => e.stopPropagation()}>
                <h2>{getModalTitle()}</h2>
                <div className="shelf-list">
                    {availableShelves.map(shelf => (
                        <div
                            key={shelf.id || shelf.shelf_id}
                            className={`shelf-option ${targetShelf?.id === shelf.id ||
                                    targetShelf?.shelf_id === shelf.shelf_id ?
                                    'selected' : ''
                                }`}
                            onClick={() => setTargetShelf(shelf)}
                        >
                            <div className="shelf-option-content">
                                <span className="shelf-name">{shelf.name || shelf.shelf_name}</span>
                                <span className="book-count">
                                    {shelf.bookCount} {shelf.bookCount === 1 ? 'book' : 'books'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="form-actions">
                    <button
                        className="batch-action-button move"
                        onClick={() => handleMove(targetShelf)}
                        disabled={!targetShelf || isSubmitting}
                    >
                        {getButtonText()}
                    </button>
                    <button
                        className="batch-action-button cancel"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveToShelfModal;