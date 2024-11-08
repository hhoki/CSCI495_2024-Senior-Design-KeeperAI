import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VerticalNavbar from '../components/VerticalNavbar';
import ShelfNavbar from '../components/ShelfNavbar';
import BookCard from '../components/BookCard';
import BookDetailsModal from '../components/BookDetailsModal';
import AddShelfModal from '../components/AddShelfModal';
import './Library.css';

const Library = () => {
    const [shelves, setShelves] = useState([]);
    const [selectedShelf, setSelectedShelf] = useState(null);
    const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
    const [books, setBooks] = useState([]);
    const [draggedBookIndex, setDraggedBookIndex] = useState(null);
    const [placeholderIndex, setPlaceholderIndex] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const [searchParams] = useSearchParams();

  const deleteShelf = async (shelfId) => {
    try {
      await axios.delete(`http://localhost:5000/shelf/${shelfId}`);
      setShelves(prevShelves => prevShelves.filter(shelf => shelf.id !== shelfId));
      if (selectedShelf && selectedShelf.id === shelfId) {
        setSelectedShelf(null);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error deleting shelf:', error);
      // Handle error (e.g., show error message to user)
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
  

  const handleShelfSelect = useCallback(async (shelfId) => {
    console.log('handleShelfSelect called with:', shelfId);
    try {
      // Convert shelfId to number if it's a string
      const numericShelfId = typeof shelfId === 'string' ? parseInt(shelfId, 10) : shelfId;
      
      const targetShelf = shelves.find(s => 
        s.shelf_id === numericShelfId || 
        s.id === numericShelfId ||
        s.shelf_id === shelfId ||
        s.id === shelfId
      );
      
      console.log('Found target shelf:', targetShelf);
      
      if (targetShelf) {
        setSelectedShelf(targetShelf);
        // Fetch books for the selected shelf
        const response = await axios.get(`http://localhost:5000/book/shelf/${shelfId}`);
        setBooks(response.data.books || []);
      } else {
        console.error('Shelf not found:', shelfId);
      }
    } catch (error) {
      console.error('Error selecting shelf:', error);
    }
  }, [shelves]);


  const handleAddShelf = async (newShelf) => {
    try {
      console.log('Adding new shelf:', newShelf);
      const { data } = await axios.post('http://localhost:5000/shelf', {
        shelf_name: newShelf.name,
        shelf_description: newShelf.description
      });
  
      console.log('Server response:', data);
      setShelves(prevShelves => [...prevShelves, data.shelf]);
      setIsAddShelfModalOpen(false);
    } catch (error) {
      console.error('Error creating shelf:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleShelfUpdate = async (updatedShelf) => {
    if (!updatedShelf || !updatedShelf.id) {
      console.error('Invalid shelf data:', updatedShelf);
      return;
    }
  
    try {
      console.log('Updating shelf:', updatedShelf);
      const { data } = await axios.patch(`http://localhost:5000/shelf/${updatedShelf.id}`, {
        shelf_name: updatedShelf.name,
        shelf_description: updatedShelf.description
      });
  
      console.log('Server response:', data);
  
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
      // Handle error (e.g., show error message to user)
    }
  };


  const handleDragStart = useCallback((e, { book, index }) => {
    console.log('Drag started:', book.title, 'at index', index);
    setDraggedBookIndex(index);
    e.dataTransfer.setData('text/plain', JSON.stringify({ book, index }));
  }, []);

  const handleDragEnd = useCallback(() => {
    console.log('Drag ended');
    setDraggedBookIndex(null);
    setPlaceholderIndex(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    const bookCard = e.target.closest('.book-card');
    if (!bookCard) return;
  
    const rect = bookCard.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
  
    let newPlaceholderIndex = parseInt(bookCard.dataset.index, 10);
  
    //If the mouse is on the right half of the card, place the placeholder after this card
    if (offsetX > width / 2) {
      newPlaceholderIndex += 1;
    }
  
    if (newPlaceholderIndex !== placeholderIndex) {
      console.log('Placeholder updated to index:', newPlaceholderIndex);
      setPlaceholderIndex(newPlaceholderIndex);
    }
  }, [placeholderIndex]);

  const handleDeleteBook = async (bookId) => {
    try {
      setBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId));
      
      if (selectedShelf) {
        const response = await axios.get(`http://localhost:5000/book/shelf/${selectedShelf.id}`);
        setBooks(response.data.books || []);
      }

      setSelectedBook(null);
    } catch (error) {
      console.error('Error refreshing books after deletion:', error);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    console.log('Drop event triggered');
    const { index: startIndex } = JSON.parse(e.dataTransfer.getData('text/plain'));
    const endIndex = placeholderIndex;
  
    console.log('Dropping book from index', startIndex, 'to index', endIndex);
  
    if (startIndex === endIndex || endIndex === null) {
      console.log('Drop cancelled: same position or invalid end index');
      return;
    }

    setBooks(prevBooks => {
      const newBooks = [...prevBooks];
      const [draggedBook] = newBooks.splice(startIndex, 1);
  
      const adjustedEndIndex = startIndex < endIndex ? endIndex - 1 : endIndex;
      newBooks.splice(adjustedEndIndex, 0, draggedBook);
  
      console.log('Books after reorder:', newBooks.map(b => `${b.title} (Shelf: ${b.shelfId})`));
      return newBooks;
    });
  
    setDraggedBookIndex(null);
    setPlaceholderIndex(null);
  }, [placeholderIndex]);

  useEffect(() => {
    console.log('Books state updated:', books.map(b => `${b.title} (Shelf: ${b.shelfId})`));
  }, [books]);

  const handleBookClick = useCallback((book) => {
    setSelectedBook(book);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedBook(null);
  }, []);

  useEffect(() => {
    const initializeLibrary = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/shelf');
        console.log('Fetched shelves:', data.shelves);
        setShelves(data.shelves);
  
        // Get shelfId from URL parameters
        const shelfId = searchParams.get('shelfId');
        console.log('ShelfId from URL:', shelfId);
  
        if (shelfId) {
          // Convert shelfId to number since URL parameters are strings
          const numericShelfId = parseInt(shelfId, 10);
          console.log('Numeric ShelfId:', numericShelfId);
          
          const targetShelf = data.shelves.find(s => 
            s.shelf_id === numericShelfId || 
            s.id === numericShelfId ||
            s.shelf_id === shelfId ||
            s.id === shelfId
          );
          
          console.log('Shelf comparison:', data.shelves.map(s => ({
            shelf_id: s.shelf_id,
            id: s.id,
            matches: s.shelf_id === numericShelfId || s.id === numericShelfId
          })));
          
          console.log('Target shelf from URL:', targetShelf);
          
          if (targetShelf) {
            setSelectedShelf(targetShelf);
            const booksResponse = await axios.get(`http://localhost:5000/book/shelf/${shelfId}`);
            setBooks(booksResponse.data.books || []);
          } else {
            console.error('Shelf not found with ID:', shelfId);
            // Fallback to first shelf if target not found
            if (data.shelves.length > 0) {
              setSelectedShelf(data.shelves[0]);
              const booksResponse = await axios.get(`http://localhost:5000/book/shelf/${data.shelves[0].shelf_id}`);
              setBooks(booksResponse.data.books || []);
            }
          }
        } else if (data.shelves.length > 0) {
          // No shelf ID in URL, select first shelf
          setSelectedShelf(data.shelves[0]);
          const booksResponse = await axios.get(`http://localhost:5000/book/shelf/${data.shelves[0].shelf_id}`);
          setBooks(booksResponse.data.books || []);
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
            onAddBook={handleBooksAdded} // Pass the handler here
            onShelfUpdate={handleShelfUpdate}
            onDeleteShelf={() => deleteShelf(selectedShelf.id)}
          />
        )}
        <main className="content-area">
          <div 
            className="book-grid" 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
          >
            {books.map((book, index) => (
              <React.Fragment key={book.book_id}>
                {index === placeholderIndex && draggedBookIndex !== null && (
                  <div className="book-card-placeholder"></div>
                )}
                <BookCard 
                  book={book}
                  index={index}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isBeingDragged={index === draggedBookIndex}
                  onClick={() => handleBookClick(book)}
                  onUpdateBook={handleBookUpdate}
                />
              </React.Fragment>
            ))}
            {placeholderIndex === books.length && draggedBookIndex !== null && (
              <div className="book-card-placeholder"></div>
            )}
          </div>
        </main>
      </div>

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
    </div>
  );
};


export default Library;