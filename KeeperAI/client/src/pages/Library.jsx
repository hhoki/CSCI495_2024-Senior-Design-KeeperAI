import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { MoveHorizontal, Trash2, X } from 'lucide-react';
import VerticalNavbar from '../components/VerticalNavbar';
import ShelfNavbar from '../components/ShelfNavbar';
import BookCard from '../components/BookCard';
import BookDetailsModal from '../components/BookDetailsModal';
import AddShelfModal from '../components/AddShelfModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import MoveToShelfModal from '../components/MoveToShelfModal';
import api from '../axiosConfig';
import './Library.css';

const Library = () => {
  // State Management
  const [shelves, setShelves] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [draggedBookIndex, setDraggedBookIndex] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Multi-select state
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const location = useLocation();

  

  // Selection Handlers
  const toggleBookSelection = (bookId) => {
    setSelectedBooks(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(bookId)) {
        newSelection.delete(bookId);
      } else {
        newSelection.add(bookId);
      }
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedBooks(new Set());
  };

  // Batch Operations
  const handleBatchMove = async (targetShelf) => {
    try {
      setIsSubmitting(true);

      console.log('Moving books to shelf:', targetShelf);
      console.log('Selected books:', Array.from(selectedBooks));

      // Update books in database
      const updatePromises = Array.from(selectedBooks).map(bookId => {
        console.log(`Updating book ${bookId} to shelf ${targetShelf.shelf_id}`);
        return api.patch(`/book/${bookId}`, {
          shelf_id: targetShelf.shelf_id // Always use shelf_id
        });
      });

      await Promise.all(updatePromises);

      // Remove moved books from current view
      setBooks(prevBooks =>
        prevBooks.filter(book => !selectedBooks.has(book.book_id))
      );

      // Update shelves state
      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (shelf.shelf_id === targetShelf.shelf_id) {
            return {
              ...shelf,
              book_count: (shelf.book_count || 0) + selectedBooks.size
            };
          }
          if (shelf.shelf_id === selectedShelf.shelf_id) {
            return {
              ...shelf,
              book_count: Math.max(0, (shelf.book_count || 0) - selectedBooks.size)
            };
          }
          return shelf;
        })
      );

      setSelectedBooks(new Set());
      setShowMoveModal(false);

    } catch (error) {
      console.error('Error moving books:', error);
      if (selectedShelf) {
        const response = await api.get(`/book/shelf/${selectedShelf.shelf_id}`);
        setBooks(response.data.books || []);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      setBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId));

      if (selectedShelf) {
        const response = await api.get(`/book/shelf/${selectedShelf.id}`);
        setBooks(response.data.books || []);
      }

      setSelectedBook(null);
    } catch (error) {
      console.error('Error refreshing books after deletion:', error);
    }
  };

  const handleAddRecommendation = async (targetShelf) => {
    try {
      const recommendedBook = location.state.addBook;
      const bookData = {
        title: recommendedBook.title,
        author: recommendedBook.author,
        description: recommendedBook.description,
        published_date: recommendedBook.published_date,
        isbn: recommendedBook.isbn,
        cover: recommendedBook.cover,
        genres: recommendedBook.genres,
        shelf_id: targetShelf.shelf_id || targetShelf.id
      };

      await api.post('/book/batch', [bookData]);

      // Refresh the shelf if we're on it
      if (selectedShelf?.shelf_id === targetShelf.shelf_id) {
        const response = await api.get(`/book/shelf/${targetShelf.shelf_id}`);
        setBooks(response.data.books || []);
      }

      // Clear the recommendation state
      navigate(location.pathname, { replace: true, state: {} });
      setShowMoveModal(false);

    } catch (error) {
      console.error('Error adding recommended book:', error);
    }
  };

  // Also update useEffect to handle recommendations
  useEffect(() => {
    // Check for recommended book in location state
    if (location.state?.addBook) {
      setShowMoveModal(true);
    }
  }, [location.state]);

  const handleBatchDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedBooks).map(bookId =>
          api.delete(`/book/${bookId}`)
        )
      );

      setBooks(prevBooks => prevBooks.filter(book => !selectedBooks.has(book.book_id)));
      setSelectedBooks(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting books:', error);
    }
  };

  // Shelf Management
  const deleteShelf = async (shelfId) => {
    try {
      await api.delete(`/shelf/${shelfId}`);
      setShelves(prevShelves => prevShelves.filter(shelf => shelf.id !== shelfId));
      if (selectedShelf && selectedShelf.id === shelfId) {
        setSelectedShelf(null);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error deleting shelf:', error);
    }
  };

  const handleBookUpdate = (updatedBook) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.book_id === updatedBook.book_id ? { ...book, ...updatedBook } : book
      )
    );
    if (selectedBook && selectedBook.book_id === updatedBook.book_id) {
      setSelectedBook(prevBook => ({ ...prevBook, ...updatedBook }));
    }
  };

  const handleBooksAdded = (newBooks) => {
    setBooks(prevBooks => [...prevBooks, ...newBooks]);
  };

  // Shelf Selection
  const handleShelfSelect = useCallback(async (shelfId) => {
    try {
      console.log('Selecting shelf:', shelfId); // Debug log

      const numericShelfId = typeof shelfId === 'string' ? parseInt(shelfId, 10) : shelfId;
      
      const targetShelf = shelves.find(s =>
        s.shelf_id === numericShelfId ||
        s.id === numericShelfId
      );

      console.log('Found target shelf:', targetShelf); // Debug log

      if (targetShelf) {
        setSelectedShelf(targetShelf);

        const fetchId = targetShelf.shelf_id || targetShelf.id;

        try {
          const response = await api.get(`/book/shelf/${fetchId}`);
          setBooks(response.data.books || []);
        } catch (error) {
          console.error('Error fetching books:', error);
          setBooks([]);
        }
        clearSelection();
      }
    } catch (error) {
      console.error('Error in handleShelfSelect:', error);
    }
  }, [shelves]);

  const handleAddShelf = async (newShelf) => {
    try {
      const { data } = await api.post('/shelf', {
        shelf_name: newShelf.name,
        shelf_description: newShelf.description
      });
      setShelves(prevShelves => [...prevShelves, data.shelf]);
      setIsAddShelfModalOpen(false);
    } catch (error) {
      console.error('Error creating shelf:', error);
    }
  };

  const handleShelfUpdate = async (updatedShelf) => {
    if (!updatedShelf || !updatedShelf.id) return;
    try {
      await api.patch(`/shelf/${updatedShelf.id}`, {
        shelf_name: updatedShelf.name,
        shelf_description: updatedShelf.description
      });

      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === updatedShelf.id ? { ...shelf, ...updatedShelf } : shelf
        )
      );

      if (selectedShelf && selectedShelf.id === updatedShelf.id) {
        setSelectedShelf(updatedShelf);
      }
    } catch (error) {
      console.error('Error updating shelf:', error);
    }
  };

  const handleDragStart = useCallback((e, { book, index }) => {
    setDraggedBookIndex(index);
    e.dataTransfer.setData('text/plain', JSON.stringify({ book, index }));
    e.dataTransfer.effectAllowed = 'move';

    // Add dragging class to source element
    e.target.classList.add('dragging');
  }, []);

  const handleDragEnd = useCallback((e) => {
    setDraggedBookIndex(null);
    setPlaceholderIndex(null);
    setIsDraggingOver(false);

    // Remove dragging class
    e.target.classList.remove('dragging');
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDraggingOver(true);

    const bookGrid = e.currentTarget;
    const bookCards = Array.from(bookGrid.getElementsByClassName('book-card'));
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Special handling for when mouse is before the first card
    const firstCard = bookCards[0];
    if (firstCard) {
      const firstCardRect = firstCard.getBoundingClientRect();
      if (mouseX < firstCardRect.left + (firstCardRect.width * 0.3)) {
        setPlaceholderIndex(0);
        return;
      }
    }

    // Find the closest book card to the mouse position
    let closestIndex = -1;
    let closestDistance = Infinity;

    bookCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance to the center of the card
      const distance = Math.hypot(mouseX - centerX, mouseY - centerY);

      // Update closest if this card is closer
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    // If we found a closest card
    if (closestIndex !== -1) {
      const rect = bookCards[closestIndex].getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;

      // If mouse is past the center point of the card, place after it
      const newIndex = mouseX > cardCenterX ? closestIndex + 1 : closestIndex;

      // Only update if the position has actually changed
      if (newIndex !== placeholderIndex) {
        setPlaceholderIndex(newIndex);
      }
    } else {
      // If no closest card found, append to the end
      setPlaceholderIndex(bookCards.length);
    }
  }, [placeholderIndex]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { index: startIndex } = data;
    const endIndex = placeholderIndex;

    if (startIndex === endIndex || endIndex === null) return;

    setBooks(prevBooks => {
      const newBooks = [...prevBooks];
      const [draggedBook] = newBooks.splice(startIndex, 1);
      const adjustedEndIndex = startIndex < endIndex ? endIndex - 1 : endIndex;
      newBooks.splice(adjustedEndIndex, 0, draggedBook);
      return newBooks;
    });

    setDraggedBookIndex(null);
    setPlaceholderIndex(null);
    setIsDraggingOver(false);
  }, [placeholderIndex]);


  const handleBookClick = useCallback((book) => {
    if (selectedBooks.size > 0) {
      toggleBookSelection(book.book_id);
    } else {
      setSelectedBook(book);
    }
  }, [selectedBooks]);

  const handleCloseModal = useCallback(() => {
    setSelectedBook(null);
  }, []);

  // Initial Load
  useEffect(() => {
    const initializeLibrary = async () => {
      try {
        const { data } = await api.get('/shelf');
        // Map shelves to include book count
        const shelvesWithCounts = await Promise.all(data.shelves.map(async (shelf) => {
          try {
            const booksResponse = await api.get(`/book/shelf/${shelf.shelf_id}`);
            return {
              ...shelf,
              book_count: booksResponse.data.books?.length || 0,
              books: booksResponse.data.books || []
            };
          } catch (error) {
            console.error(`Error fetching books for shelf ${shelf.shelf_id}:`, error);
            return {
              ...shelf,
              book_count: 0,
              books: []
            };
          }
        }));
        setShelves(shelvesWithCounts);

        // Get shelfId from URL parameters
        const shelfId = searchParams.get('shelfId');
        const bookId = searchParams.get('bookId');

        // If there's a shelfId in the URL, select that shelf
        if (shelfId) {
          const targetShelf = shelvesWithCounts.find(s =>
            s.shelf_id === parseInt(shelfId) || s.id === parseInt(shelfId)
          );

          if (targetShelf) {
            try {
              const booksResponse = await api.get(`/book/shelf/${shelfId}`);
              setBooks(booksResponse.data.books || []);
              setSelectedShelf(targetShelf);

              // If there's a specific book to highlight
              if (bookId) {
                const book = booksResponse.data.books?.find(b => b.book_id === parseInt(bookId));
                if (book) {
                  setSelectedBook(book);
                }
              }
            } catch (error) {
              console.error('Error fetching shelf books:', error);
              setBooks([]);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing library:', error);
        setError(`Failed to load library. ${error.response?.data?.message || error.message}`);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeLibrary();
  }, [searchParams]);

  if (isInitialLoading) {
    return (
      <div className="library-container">
        <div className="content-wrapper loading-wrapper">
          <div className="loading-spinner">Loading your library...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-container">
        <div className="content-wrapper error-wrapper">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="library-container">
      <VerticalNavbar
        shelves={shelves}
        selectedShelf={selectedShelf}
        onShelfSelect={handleShelfSelect}
        onAddShelfClick={() => setIsAddShelfModalOpen(true)}
      />
      <div className="content-wrapper">
        {selectedShelf && (
          <ShelfNavbar
            shelf={selectedShelf}
            onAddBook={handleBooksAdded}
            onShelfUpdate={handleShelfUpdate}
            onDeleteShelf={() => deleteShelf(selectedShelf.id)}
          />
        )}
        <main className="content-area">
          <div
            className={`book-grid ${isDraggingOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
            {books.map((book, index) => (
              <React.Fragment key={book.book_id}>
                {index === placeholderIndex && (
                  <div className="book-card-placeholder" />
                )}
                <BookCard
                  book={book}
                  index={index}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isBeingDragged={index === draggedBookIndex}
                  onClick={handleBookClick}
                  onUpdateBook={handleBookUpdate}
                  selected={selectedBooks.has(book.book_id)}
                  onSelect={() => toggleBookSelection(book.book_id)}
                />
              </React.Fragment>
            ))}
            {placeholderIndex === books.length && (
              <div className="book-card-placeholder" />
            )}
          </div>
        </main>

        {/* Batch Actions Bar */}
        <div className={`batch-actions-bar ${selectedBooks.size > 0 ? 'visible' : ''}`}>
          <div className="selected-count">
            {selectedBooks.size} books selected
          </div>
          <div className="batch-actions">
            <button
              className="batch-action-button move"
              onClick={() => setShowMoveModal(true)}
            >
              <MoveHorizontal size={16} />
              Move to Shelf
            </button>
            <button
              className="batch-action-button delete"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button
              className="batch-action-button cancel"
              onClick={clearSelection}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseModal}
          onUpdateBook={handleBookUpdate}
          onDeleteBook={handleDeleteBook}
        />
      )}

      {isAddShelfModalOpen && (
        <AddShelfModal
          onClose={() => setIsAddShelfModalOpen(false)}
          onAddShelf={handleAddShelf}
        />
      )}

      <MoveToShelfModal
        isOpen={showMoveModal}
        onClose={() => {
          setShowMoveModal(false);
          // If it's a recommendation being added
          if (location.state?.addBook) {
            setSelectedBook(null);
          }
        }}
        shelves={shelves}
        selectedShelf={selectedShelf}
        onMove={location.state?.addBook ? handleAddRecommendation : handleBatchMove}
        selectedBooks={selectedBooks}
        singleBook={location.state?.addBook} // Pass the recommended book if it exists
      />

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBatchDelete}
        itemName={`${selectedBooks.size} books`}
        itemType="books"
      />
    </div>
  );
};


export default Library;