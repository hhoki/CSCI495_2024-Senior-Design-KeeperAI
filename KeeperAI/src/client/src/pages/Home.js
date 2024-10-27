import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookCard from '../components/BookCard';
import { Library, BookOpen, BarChart3, ChevronRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [shelves, setShelves] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalBooks: 0,
    genreBreakdown: {},
    readingStatusBreakdown: {}
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchShelvesWithBooks();
  }, []);

  const fetchShelvesWithBooks = async () => {
    try {
      const shelvesResponse = await axios.get('http://localhost:5000/shelf');
      const shelvesList = shelvesResponse.data.shelves;
      
      const shelvesWithBooks = await Promise.all(
        shelvesList.map(async (shelf) => {
          try {
            const booksResponse = await axios.get(`http://localhost:5000/book/shelf/${shelf.shelf_id}`);
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

  const handleShelfClick = (shelf) => {
    navigate(`/library?shelfId=${shelf.shelf_id}`);
  };

  useEffect(() => {
    fetchShelvesWithBooks();
  }, []);

  return (
    <div className="home-container">
      <section className="home-section shelves-section">
        <div className="section-header">
          <Library size={24} />
          <h2>Your Library</h2>
        </div>
        <div className="shelves-grid">
          {shelves.map((shelf) => (
            <div 
              key={shelf.shelf_id} 
              className="shelf-card"
              onClick={() => handleShelfClick(shelf)}
            >
              <div className="shelf-header">
                <h3>{shelf.name}</h3>
                <span className="book-count">
                  {shelf.books?.length || 0} books
                </span>
              </div>
              <div className="shelf-books">
                {shelf.books && shelf.books.length > 0 ? (
                  shelf.books.slice(0, 4).map((book) => (
                    <img
                      key={book.book_id}
                      src={book.cover || "/api/placeholder/60/90"}
                      alt={book.title}
                      className="shelf-book-cover"
                      title={book.title}
                    />
                  ))
                ) : (
                  <div className="empty-shelf">No books yet</div>
                )}
              </div>
            </div>
          ))}

          {/* View All Shelf card */}
          <div 
            className="shelf-card view-all-card"
            onClick={() => navigate('/library')} // This will use the default first shelf
            >
            <div className="view-all-content">
                <h3>View All Shelves</h3>
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
        </div>
        <div className="recommendations-grid">
          {recommendations.map((book) => (
            <BookCard
              key={book.book_id}
              book={book}
              onClick={() => {}} // Handle recommendation click
            />
          ))}
        </div>
      </section>

      {/* Analytics Section */}
      <section className="home-section analytics-section">
        <div className="section-header">
          <BarChart3 size={24} />
          <h2>Library Analytics</h2>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card total-books">
            <h3>Total Books</h3>
            <div className="analytics-value">{analytics.totalBooks}</div>
          </div>
          
          <div className="analytics-card genre-breakdown">
            <h3>Genre Breakdown</h3>
            <div className="genre-chart">
              {Object.entries(analytics.genreBreakdown).map(([genre, count]) => (
                <div key={genre} className="genre-bar">
                  <div className="genre-label">{genre}</div>
                  <div 
                    className="genre-value" 
                    style={{ 
                      width: `${(count / analytics.totalBooks) * 100}%` 
                    }}
                  >
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card reading-status">
            <h3>Reading Status</h3>
            <div className="status-breakdown">
              {Object.entries(analytics.readingStatusBreakdown).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-label">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;