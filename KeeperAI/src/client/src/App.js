import React, { useState, useEffect, useCallback } from 'react';
import HorizontalNavbar from './components/HorizontalNavbar';
import VerticalNavbar from './components/VerticalNavbar';
import ShelfNavbar from './components/ShelfNavbar';
import BookCard from './components/BookCard';
import BookDetailsModal from './components/BookDetailsModal';
import AddShelfModal from './components/AddShelfModal';

import './App.css';

const App = () => {
  const [shelves, setShelves] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [draggedBookIndex, setDraggedBookIndex] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  

  const deleteShelf = async (shelfId) => {
    try {
      const response = await fetch(`http://localhost:5000/shelf/${shelfId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to delete shelf: ${response.status} ${errorText}`);
      }

      setShelves(prevShelves => prevShelves.filter(shelf => shelf.id !== shelfId));
      if (selectedShelf && selectedShelf.id === shelfId) {
        setSelectedShelf(null);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error deleting shelf:', error);
      //Handle error (e.g., show error message to user)
    }
  };


  const handleShelfSelect = useCallback((shelfId) => {
    console.log('Selecting shelf with ID:', shelfId);
    setShelves(currentShelves => {
      console.log('Current shelves in handleShelfSelect:', currentShelves);
      const shelf = currentShelves.find(s => s.id === shelfId || s.shelf_id === shelfId);
      if (shelf) {
        setSelectedShelf(shelf);
        console.log('Selected shelf:', shelf);
        
        // Fetch books for the selected shelf
        fetch(`http://localhost:5000/book/shelf/${shelfId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch books for shelf');
            }
            return response.json();
          })
          .then(data => {
            console.log('Fetched books:', data.books);
            setBooks(data.books);
          })
          .catch(error => {
            console.error('Error fetching books for shelf:', error);
            setBooks([]);
          });
      } else {
        console.error('Shelf not found with ID:', shelfId);
        console.log('Available shelf IDs:', currentShelves.map(s => s.id || s.shelf_id));
      }
      return currentShelves; // Return the current shelves state unchanged
    });
  }, []);



  const handleAddShelf = async (newShelf) => {
    try {
      console.log('Adding new shelf:', newShelf);
      const response = await fetch('http://localhost:5000/shelf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shelf_name: newShelf.name,
          shelf_description: newShelf.description
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create shelf');
      }
  
      const data = await response.json();
      console.log('Server response:', data);
  
      setShelves(prevShelves => [...prevShelves, data.shelf]);
      setIsAddShelfModalOpen(false);
    } catch (error) {
      console.error('Error creating shelf:', error);
      // Handle error (e.g., show error message to user)
    }
  };


  const fetchShelves = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/shelf');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched shelves:', data.shelves);
      
      setShelves(data.shelves);
      
      // Select the first shelf by default, but only after setting the shelves state
      if (data.shelves && data.shelves.length > 0) {
        console.log('Selecting first shelf:', data.shelves[0]);
        handleShelfSelect(data.shelves[0].id || data.shelves[0].shelf_id);
      }
    } catch (error) {
      console.error('Error fetching shelves:', error);
      setError(`Failed to load shelves. ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [handleShelfSelect]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/book');
      console.log('Book response status:', response.status);
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = JSON.parse(text);
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError(`Failed to load books. ${error.message}`);
    }
  };

  useEffect(() => {
    fetchShelves();
  }, [fetchShelves]);

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


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <HorizontalNavbar />
      <div className="main-content">
        <VerticalNavbar
          shelves={shelves}
          selectedShelf={selectedShelf}
          onShelfSelect={handleShelfSelect}
          onAddShelfClick={() => setIsAddShelfModalOpen(true)}
        />
        <div className="content-wrapper">
          {selectedShelf && (
            <ShelfNavbar
              shelfName={selectedShelf.name}
              onAddBook={() => {/* Add book logic */}}
              onShelfSettings={() => {/* Shelf settings logic */}}
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
                  />
                </React.Fragment>
              ))}
              {placeholderIndex === books.length && draggedBookIndex !== null && (
                <div className="book-card-placeholder"></div>
              )}
            </div>
          </main>
        </div>
      </div>
      {selectedBook && (
        <BookDetailsModal book={selectedBook} onClose={handleCloseModal} />
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

export default App;