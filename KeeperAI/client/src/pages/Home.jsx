import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, BookOpen, BarChart3, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import api, { longRunningApi } from '../axiosConfig';
import { getImageUrl, handleImageError } from '../utils/imageUtils.js';
import RecommendationSkeleton from '../components/RecommendationSkeleton';
import MoveToShelfModal from '../components/MoveToShelfModal.jsx';
import './Home.css';


const ShelfPreview = ({ shelf, onShelfClick }) => {
  const [visibleBooks, setVisibleBooks] = useState(4);
  const shelfBooksRef = useRef(null);

  useEffect(() => {
    const calculateVisibleBooks = () => {
      if (!shelfBooksRef.current) return;

      const container = shelfBooksRef.current;
      const containerWidth = container.clientWidth;
      const BOOK_WIDTH = 75; // Increased book width
      const GAP = 5; // Match gap from CSS

      // Calculate how many books can fit minus space for "+X more"
      const maxBooks = Math.floor((containerWidth - (BOOK_WIDTH + GAP)) / (BOOK_WIDTH + GAP));
      setVisibleBooks(Math.max(1, maxBooks));
    };

    calculateVisibleBooks();

    const observer = new ResizeObserver(calculateVisibleBooks);
    if (shelfBooksRef.current) {
      observer.observe(shelfBooksRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const displayedBooks = shelf.books?.slice(0, visibleBooks) || [];
  const remainingBooks = (shelf.books?.length || 0) - visibleBooks;

  return (
    <div className="shelf-card" onClick={() => onShelfClick(shelf)}>
      <div className="shelf-header">
        <h3>{shelf.name || shelf.shelf_name}</h3>
        <span className="book-count">
          {shelf.books?.length || 0} books
        </span>
      </div>
      <div className="shelf-books" ref={shelfBooksRef}>
        {shelf.books && shelf.books.length > 0 ? (
          <>
            {displayedBooks.map((book) => (
              <img
                key={book.book_id}
                src={getImageUrl(book.cover, book.title)}
                alt={book.title}
                className="shelf-book-cover"
                onError={(e) => handleImageError(e, book.title)}
                title={book.title}
              />
            ))}
            {remainingBooks > 0 && (
              <div className="more-books-indicator">
                +{remainingBooks} more
              </div>
            )}
          </>
        ) : (
          <div className="empty-shelf">
            No books yet
          </div>
        )}
      </div>
    </div>
  );
};


const Home = () => {
  const [shelves, setShelves] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollingInterval = useRef(null);
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      const response = await longRunningApi.get('/recommendations');
      console.log('Recommendations response:', response.data);

      if (response.data.message === "Generating recommendations...") {
        setIsGenerating(true);
        return false;
      }

      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        setIsGenerating(false);
        return true;
      }

      return false;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('Recommendations still generating, will retry...');
        setIsGenerating(true);
        return false;
      }

      console.error('Error fetching recommendations:', error);
      setIsGenerating(false);
      return true;
    }
  };

  const startPolling = useCallback(() => {
    if (pollingInterval.current) return;

    pollingInterval.current = setInterval(async () => {
      const shouldStop = await fetchRecommendations();
      if (shouldStop) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    }, 10000);
  }, []);

  const fetchShelvesWithBooks = async () => {
    try {
      const shelvesResponse = await api.get('/shelf');
      const shelvesList = shelvesResponse.data.shelves;

      const shelvesWithBooks = await Promise.all(
        shelvesList.map(async (shelf) => {
          try {
            const booksResponse = await api.get(`/book/shelf/${shelf.shelf_id}`);
            return {
              ...shelf,
              books: booksResponse.data.books || [],
            };
          } catch (error) {
            console.error(`Error fetching books for shelf ${shelf.shelf_id}:`, error);
            return {
              ...shelf,
              books: [],
            };
          }
        })
      );

      const sortedShelves = shelvesWithBooks
        .sort((a, b) => (b.books?.length || 0) - (a.books?.length || 0))
        .slice(0, 3);

      setShelves(sortedShelves);
    } catch (error) {
      console.error('Error fetching shelves:', error);
      setShelves([]);
    }
  };

  const handleAddToShelf = (book) => {
    setSelectedBook(book);
    setShowMoveModal(true);
  };

  const handleMoveToShelf = async (targetShelf) => {
    try {
      if (!selectedBook || !targetShelf) return;

      const bookData = {
        title: selectedBook.title,
        author: selectedBook.author,
        description: selectedBook.description,
        published_date: selectedBook.published_date,
        isbn: selectedBook.isbn,
        cover: selectedBook.cover,
        genres: selectedBook.genres || [],
        shelf_id: targetShelf.shelf_id // Always use shelf_id
      };

      await api.post('/book/batch', [bookData]);

      setRecommendations(prev =>
        prev.filter(book => book.title !== selectedBook.title)
      );

      setShowMoveModal(false);
      setSelectedBook(null);
    } catch (error) {
      console.error('Error adding book to shelf:', error);
    }
  };

  

  useEffect(() => {
    // Fetch shelves and start recommendation process
    fetchShelvesWithBooks();
    fetchRecommendations().then(shouldPoll => {
      if (shouldPoll === false) {
        startPolling();
      }
    });

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [startPolling]);

  const handleShelfClick = (shelf) => {
    navigate(`/library?shelfId=${shelf.shelf_id}`);
  };

  return (
    <div className="home-container">
      <section className="home-section shelves-section">
        <div className="section-header">
          <Library size={24} />
          <h2>Your Library</h2>
        </div>
        <div className="shelves-grid">
          {shelves.map((shelf) => (
            <ShelfPreview
              key={shelf.shelf_id}
              shelf={shelf}
              onShelfClick={() => handleShelfClick(shelf)}
            />
          ))}

          <div
            className="shelf-card view-all-card"
            onClick={() => navigate('/library')}
          >
            <div className="view-all-content">
              <div className="view-all-text">
                <h3>View All Shelves</h3>
                <p>See your complete library</p>
              </div>
              <ChevronRight size={24} />
            </div>
          </div>
        </div>
      </section>


      {/* Recommendations Section */}
      <section className="home-section recommendations-section">
        <div className="section-header">
          <BookOpen size={24} />
          <h2>Recommended for You</h2>
          {isGenerating && (
            <div className="generating-indicator">
              <RefreshCw size={16} className="spinning" />
              Generating recommendations...
            </div>
          )}
        </div>
        <div className="recommendations-grid">
          {isGenerating ? (
            Array(6).fill(0).map((_, index) => (
              <RecommendationSkeleton key={index} />
            ))
          ) : recommendations.length > 0 ? (
              recommendations.map((book, index) => (
                <div key={index} className="recommendation-card">
                  <img
                    src={getImageUrl(book.cover, book.title)}
                    alt={book.title}
                    className="recommendation-cover"
                    onError={(e) => handleImageError(e, book.title)}
                  />
                  <div className="recommendation-info">
                    <h3>{book.title}</h3>
                    <p className="author">by {book.author}</p>

                    <div>
                      <div className="book-reason-label">Why this book:</div>
                      <p className="reason">{book.reason}</p>
                    </div>

                    {book.similar_to && (
                      <p className="similar-to">Similar to: {book.similar_to}</p>
                    )}

                    <button
                      className="add-to-shelf"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToShelf(book);  // Call handleAddToShelf instead of navigating
                      }}
                    >
                      <Plus size={16} />
                      Add to Shelf
                    </button>
                  </div>
                </div>
            ))
          ) : (
            <div className="no-recommendations">
              <p>No recommendations available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Analytics Section */}
      <section className="home-section analytics-section">
        <div className="section-header">
          <BarChart3 size={24} />
          <h2>Library Insights</h2>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card total-books">
            <h3>Total Books</h3>
            <div className="analytics-value">
              {shelves.reduce((total, shelf) => total + (shelf.books?.length || 0), 0)}
            </div>
          </div>

          {recommendations?.analysis && (
            <>
              <div className="analytics-card genres">
                <h3>Top Genres</h3>
                <div className="genres-list">
                  {recommendations.analysis.preferred_genres.slice(0, 5).map((genre, index) => (
                    <span key={index} className="genre-tag">{genre}</span>
                  ))}
                </div>
              </div>

              <div className="analytics-card authors">
                <h3>Favorite Authors</h3>
                <div className="authors-list">
                  {recommendations.analysis.favorite_authors.slice(0, 3).map((author, index) => (
                    <div key={index} className="author-item">{author}</div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <MoveToShelfModal
        isOpen={showMoveModal}
        onClose={() => {
          setShowMoveModal(false);
          setSelectedBook(null);
        }}
        shelves={shelves}
        selectedShelf={null} // No current shelf for recommendations
        onMove={handleMoveToShelf}
        singleBook={selectedBook} // Pass the single book being added
      />

    </div>
  );
};

export default Home;