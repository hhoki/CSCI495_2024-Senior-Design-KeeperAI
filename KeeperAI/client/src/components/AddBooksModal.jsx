import React, { useState } from 'react';
import axios from 'axios';
import { X, Trash2, RefreshCw, Search } from 'lucide-react';
import api from '../axiosConfig';
import '../styles/AddBooksModal.css';

const BookPreview = ({ book, onRemove, onTitleChange, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await onUpdate();
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="book-preview-card">
      <div className="book-preview-content">
        <img
          src={getImageUrl(book.cover, book.title)}
          alt={`Cover of ${book.title}`}
          className="book-preview-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getPlaceholderUrl(book.title, 200, 300);
          }}
        />
        <div className="book-preview-details">
          
          <div className="book-title-container">
            <input
              type="text"
              value={book.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="book-title-input"
              placeholder="Book title"
            />
            <button
              className="update-metadata-button"
              onClick={handleUpdate}
              disabled={isUpdating}
              title="Update book information"
            >
              <RefreshCw
                size={16}
                className={isUpdating ? 'spinning' : ''}
              />
            </button>
            <button
              className="remove-book-button"
              onClick={onRemove}
              title="Remove book"
            >
              <Trash2 size={18} />
            </button>
            

          </div>
          <div className="book-info">
            <span className="book-info-label">Author:</span>
            <span className="book-info-value">{book.author || 'Unknown'}</span>
          </div>
          <div className="book-info">
            <span className="book-info-label">ISBN:</span>
            <span className="book-info-value">{book.isbn || 'N/A'}</span>
          </div>
          <div className="book-info">
            <span className="book-info-label">Published:</span>
            <span className="book-info-value">{book.published_date || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddBooksModal = ({ onClose, shelfId, onBooksAdded }) => {
  const [activeTab, setActiveTab] = useState('image');
  const [file, setFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('default');
  const [detectedBooks, setDetectedBooks] = useState([]); // Books from image upload
  const [manualBooks, setManualBooks] = useState([]); // Books from manual search
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDetectedBooks([]);
  };

  const handleSubmitImage = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('bookImage', file);
    formData.append('model', selectedModel);

    try {
      console.log('Submitting image:', file);
      console.log('Selected model:', selectedModel);

      // First, detect books
      const detectResponse = await axios.post('/api/book/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Detection response:', detectResponse.data);

      if (detectResponse.data.bookTitles) {
        // Then fetch metadata for detected books
        const metadataResponse = await axios.post('/api/book/metadata', {
          bookTitles: detectResponse.data.bookTitles.map(book => book.bookTitle)
        });

        console.log('Metadata response:', metadataResponse.data);
        setDetectedBooks(metadataResponse.data.books);
      } else {
        console.error('No book titles in response:', detectResponse.data);
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    setIsSearching(true);
    try {
      const response = await api.post('/book/metadata', {
        bookTitles: [manualTitle]
      });

      if (response.data.books && response.data.books.length > 0) {
        setManualBooks(prevBooks => [...prevBooks, ...response.data.books]);
        setManualTitle('');
      }
    } catch (error) {
      console.error('Error searching for book:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTitleChange = (index, newTitle) => {
    const currentBooks = activeTab === 'image' ? detectedBooks : manualBooks;
    const setBooks = activeTab === 'image' ? setDetectedBooks : setManualBooks;

    const newBooks = [...currentBooks];
    newBooks[index] = { ...newBooks[index], title: newTitle };
    setBooks(newBooks);
  };

  const handleUpdateMetadata = async (index) => {
    const currentBooks = activeTab === 'image' ? detectedBooks : manualBooks;
    const setBooks = activeTab === 'image' ? setDetectedBooks : setManualBooks;
    const book = currentBooks[index];

    try {
      const response = api.post('/book/metadata', {
        bookTitles: [book.title]
      });

      if (response.data.books && response.data.books.length > 0) {
        const updatedMetadata = response.data.books[0];
        const newBooks = [...currentBooks];
        newBooks[index] = {
          ...updatedMetadata,
          title: book.title
        };
        setBooks(newBooks);
      }
    } catch (error) {
      console.error('Error updating book metadata:', error);
    }
  };

  const handleRemoveBook = (index) => {
    if (activeTab === 'image') {
      setDetectedBooks(books => books.filter((_, i) => i !== index));
    } else {
      setManualBooks(books => books.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const booksToAdd = activeTab === 'image' ? detectedBooks : manualBooks;
    if (booksToAdd.length === 0) return;

    setIsSubmitting(true);
    try {
      const formattedBooks = booksToAdd.map(book => ({
        ...book,
        shelf_id: shelfId
      }));

      const response = await api.post('/book/batch', formattedBooks);

      if (onBooksAdded) {
        onBooksAdded(response.data.books);
      }

      onClose();
    } catch (error) {
      console.error('Error adding books:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBooks = activeTab === 'image' ? detectedBooks : manualBooks;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="add-books-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Add Books</h2>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => handleTabChange('image')}
          >
            Upload Image
          </button>
          <button
            className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => handleTabChange('manual')}
          >
            Enter Title
          </button>
        </div>

        <div className="model-selection">
          <label htmlFor="modelSelect">Model:</label>
          <select
            id="modelSelect"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-dropdown"
            disabled={activeTab === 'manual'}
          >
            <option value="default">Default Model</option>
            <option value="advanced">Advanced Model</option>
          </select>
        </div>

        {activeTab === 'image' ? (
          <form onSubmit={handleSubmitImage} className="add-books-form">
            <div className="form-group">
              <label htmlFor="bookImage">Upload Book Image:</label>
              <input
                type="file"
                id="bookImage"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>

            {isLoading && (
              <div className="loading-indicator">
                Processing image...
              </div>
            )}

            {file && !detectedBooks.length && (
              <div className="form-actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Detect Books'}
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleManualSearch} className="manual-search-form">
            <div className="search-container">
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Enter book title..."
                className="manual-title-input"
                disabled={isSearching}
              />
              <button
                type="submit"
                className="search-button"
                disabled={isSearching || !manualTitle.trim()}
              >
                {isSearching ? (
                  <RefreshCw className="spinning" size={16} />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>
          </form>
        )}

        {currentBooks.length > 0 && (
          <>
            <div className={activeTab === 'manual' ? 'manual-search-results' : 'detected-books-grid'}>
              {currentBooks.map((book, index) => (
                <BookPreview
                  key={index}
                  book={book}
                  onRemove={() => handleRemoveBook(index)}
                  onTitleChange={(newTitle) => handleTitleChange(index, newTitle)}
                  onUpdate={() => handleUpdateMetadata(index)}
                />
              ))}
            </div>

            <div className="form-actions">
              <button
                className="confirm-selection-button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? activeTab === 'manual' ? 'Adding Book...' : 'Adding Books...'
                  : activeTab === 'manual' ? 'Add Book(s)' : 'Add Books'
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddBooksModal;