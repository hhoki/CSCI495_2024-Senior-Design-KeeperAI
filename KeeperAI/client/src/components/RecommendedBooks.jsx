import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BookCard from './BookCard';
import api from '../axiosConfig';
import '../styles/RecommendedBooks.css';

const RecommendedBooks = ({ shelves }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingToShelf, setAddingToShelf] = useState(null);
    const [showShelfSelector, setShowShelfSelector] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recommendations');
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToShelf = async (book, shelfId) => {
        try {
            setAddingToShelf(book.id);

            // Format the book data
            const bookData = {
                title: book.title,
                author: book.author,
                description: book.description,
                cover: book.cover,
                shelf_id: shelfId,
                genres: book.genres || []
            };

            // Add book to shelf
            await api.post('/book/batch', [bookData]);

            // Show success message
            alert(`Successfully added "${book.title}" to shelf!`);

            // Remove from recommendations to prevent duplicate adds
            setRecommendations(prev => prev.filter(rec => rec.id !== book.id));
        } catch (error) {
            console.error('Error adding book to shelf:', error);
            alert('Failed to add book to shelf. Please try again.');
        } finally {
            setAddingToShelf(null);
            setShowShelfSelector(false);
            setSelectedBook(null);
        }
    };

    if (loading) {
        return <div className="recommendations-loading">Loading recommendations...</div>;
    }

    return (
        <div className="recommendations-section">
            <div className="recommendations-header">
                <h2>Recommended for You</h2>
            </div>

            <div className="recommendations-grid">
                {recommendations.map((book) => (
                    <div key={book.title} className="recommendation-card-wrapper">
                        <BookCard
                            book={book}
                            onClick={() => { }}  // Optional: handle book details view
                        />
                        <button
                            className="add-to-shelf-button"
                            onClick={() => {
                                setSelectedBook(book);
                                setShowShelfSelector(true);
                            }}
                            disabled={addingToShelf === book.id}
                        >
                            <Plus size={16} />
                            Add to Shelf
                        </button>
                    </div>
                ))}
            </div>

            {/* Shelf Selection Modal */}
            {showShelfSelector && selectedBook && (
                <div className="shelf-selector-modal">
                    <div className="shelf-selector-content" onClick={e => e.stopPropagation()}>
                        <h3>Add "{selectedBook.title}" to Shelf</h3>
                        <div className="shelf-options">
                            {shelves.map(shelf => (
                                <button
                                    key={shelf.id}
                                    className="shelf-option"
                                    onClick={() => handleAddToShelf(selectedBook, shelf.id)}
                                    disabled={addingToShelf === selectedBook.id}
                                >
                                    {shelf.name}
                                </button>
                            ))}
                        </div>
                        <button
                            className="close-selector-button"
                            onClick={() => {
                                setShowShelfSelector(false);
                                setSelectedBook(null);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendedBooks;