import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  
  

  const handleShelfSelect = useCallback((shelfId) => {
    console.log('Selecting shelf with ID:', shelfId);
    setShelves(currentShelves => {
      console.log('Current shelves in handleShelfSelect:', currentShelves);
      const shelf = currentShelves.find(s => s.id === shelfId || s.shelf_id === shelfId);
      if (shelf) {
        setSelectedShelf(shelf);
        console.log('Selected shelf:', shelf);
        
        axios.get(`http://localhost:5000/book/shelf/${shelfId}`)
          .then(({ data }) => {
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
      return currentShelves;
    });
  }, []);



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

  const fetchShelves = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('http://localhost:5000/shelf');
      console.log('Fetched shelves:', data.shelves);
      
      setShelves(data.shelves);
      
      // Select the first shelf by default, but only after setting the shelves state
      if (data.shelves?.length > 0) {
        console.log('Selecting first shelf:', data.shelves[0]);
        handleShelfSelect(data.shelves[0].id || data.shelves[0].shelf_id);
      }
    } catch (error) {
      console.error('Error fetching shelves:', error);
      setError(`Failed to load shelves. ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [handleShelfSelect]);

  const fetchBooks = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/book');
      console.log('Book response:', data);
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError(`Failed to load books. ${error.response?.data?.message || error.message}`);
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
    fetchShelves();
  }, [fetchShelves]);

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
      <HorizontalNavbar 
        onBookSelect={(book) => setSelectedBook(book)}
        onShelfSelect={handleShelfSelect}
      />
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
            shelf={selectedShelf}
            onAddBook={() => {}}
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

export default App;