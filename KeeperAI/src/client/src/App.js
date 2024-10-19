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
  

  useEffect(() => {
    fetchShelves();
    fetchBooks();
  }, []);

  const fetchShelves = async () => {
    // Simulated API call
    const simulatedShelves = [
      { id: 1, name: "Fiction", description: "Books of imaginative narration" },
      { id: 2, name: "Non-Fiction", description: "Books based on facts and real events" },
      { id: 3, name: "Science", description: "Books about scientific topics and discoveries" }
    ];
    setShelves(simulatedShelves);
    setSelectedShelf(simulatedShelves[0]);
  };

  const fetchBooks = async () => {
    // Simulated API call
    const simulatedBooks = [
      { id: 1, title: "1984", author: "George Orwell", rating: 4, cover: "https://www.printmag.com/wp-content/uploads/2017/01/2a34d8_a6741e88335241308890543d203ad89dmv2.jpg", shelfId: 1 },
      { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", rating: 5, cover: "https://example.com/mockingbird-cover.jpg", shelfId: 1 },
      { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", rating: 4, cover: "https://example.com/gatsby-cover.jpg", shelfId: 1 },
      { id: 4, title: "A Brief History of Time", author: "Stephen Hawking", rating: 5, cover: "https://example.com/brief-history-cover.jpg", shelfId: 2 },
      { id: 5, title: "The Selfish Gene", author: "Richard Dawkins", rating: 4, cover: "https://example.com/selfish-gene-cover.jpg", shelfId: 3 },
    ];
    setBooks(simulatedBooks);
  };

  const handleShelfSelect = useCallback((shelfId) => {
    const shelf = shelves.find(shelf => shelf.id === shelfId);
    setSelectedShelf(shelf);
    setPlaceholderIndex(null);
    setDraggedBookIndex(null);
  }, [shelves]);

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


  const handleAddShelf = (newShelf) => {
    setShelves([...shelves, { ...newShelf, id: Date.now() }]);
    setIsAddShelfModalOpen(false);
  };

  const currentShelfBooks = books.filter(book => book.shelfId === selectedShelf?.id);

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
              />
            )}
            <main className="content-area">
            <div 
              className="book-grid" 
              onDragOver={handleDragOver} 
              onDrop={handleDrop}
            >
              {currentShelfBooks.map((book, index) => (
                <React.Fragment key={book.id}>
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
              {placeholderIndex === currentShelfBooks.length && draggedBookIndex !== null && (
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