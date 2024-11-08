const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const db = require('../config/db');
const Shelf = require('../models/Shelf');
const fs = require('fs').promises;
const axios = require('axios');

exports.detectBooks = async (req, res) => {
  console.log('Detect Books function called');

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    console.log('File path:', filePath);
    console.log('MIME type:', mimeType);

    // Upload the image file to Google Gemini
    const uploadResult = await Book.uploadToGemini(filePath, mimeType, req.file.originalname);
    console.log('File uploaded to Gemini');

    // Generate content (detect book titles) from the uploaded image
    const bookTitles = await Book.generateContentFromImage(uploadResult.file.uri, mimeType);
    console.log('Detected book titles from Gemini:', bookTitles);

    res.status(200).json({
      message: "Books detected successfully",
      bookTitles: bookTitles
    });

  } catch (error) {
    console.error('Error during book detection:', error);
    res.status(500).json({
      message: 'Failed to detect books.',
      error: error.toString()
    });
  } finally {
    // Clean up the uploaded file
    await fs.unlink(filePath).catch(console.error);
  }
};

exports.fetchOpenLibraryMetadata = async (req, res) => {
  try {
    const { bookTitles } = req.body;

    if (!bookTitles || !Array.isArray(bookTitles)) {
      return res.status(400).json({
        message: 'Invalid request. Expected array of book titles.'
      });
    }

// OpenLibary Implementation
/*     const bookMetadata = await Promise.all(
      bookTitles.map(async (bookTitle) => {
        try {
          // Search OpenLibrary API
          const openLibraryUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitle)}&fields=title,author_name,first_publish_year,isbn,cover_i,description,subtitle&limit=1`;
          const response = await axios.get(openLibraryUrl);


          if (response.data.docs && response.data.docs.length > 0) {
            const book = response.data.docs[0];
            return {
              title: bookTitle, // Use detected title from image
              author: book.author_name ? book.author_name[0] : "Unknown",
              published_date: book.first_publish_year || "N/A",
              isbn: book.isbn ? book.isbn[0] : "N/A",
              cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
              description: book.description || "No description available",
              rating: null,
              user_notes: "",
              shelf_id: null,
              shelf_location: null
            };
          } else {
            return {
              title: bookTitle,
              author: "Unknown",
              published_date: "N/A",
              isbn: "N/A",
              cover: null,
              description: "No description available",
              rating: null,
              user_notes: "",
              shelf_id: null,
              shelf_location: null,
              message: "No metadata found in OpenLibrary"
            };
          }
        } catch (error) {
          console.error(`Error fetching metadata for "${bookTitle}":`, error);
          return {
            title: bookTitle,
            message: "Error fetching metadata",
            error: error.message
          };
        }
      })
    );

    res.status(200).json({
      message: "Metadata fetched successfully",
      books: bookMetadata
    });
 */


    const bookMetadata = await Promise.all(
      bookTitles.map(async (bookTitle) => {
        try {
          // Search Google Books API
          const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}&key=${process.env.GOOGLE_BOOKS_API_KEY}&maxResults=1`;
          const response = await axios.get(googleBooksUrl);

          if (response.data.items && response.data.items.length > 0) {
            const book = response.data.items[0].volumeInfo;
            return {
              title: bookTitle, // Use detected title from image
              author: book.authors ? book.authors[0] : "Unknown",
              published_date: book.publishedDate || "N/A",
              isbn: book.industryIdentifiers ?
                book.industryIdentifiers.find(id => id.type === "ISBN_13")?.identifier ||
                book.industryIdentifiers.find(id => id.type === "ISBN_10")?.identifier ||
                "N/A" : "N/A",
              cover: book.imageLinks ?
                // Use high quality image if available
                book.imageLinks.medium ||
                book.imageLinks.large ||
                book.imageLinks.extraLarge ||
                book.imageLinks.thumbnail?.replace('zoom=1', 'zoom=3') ||
                null : null,
              description: book.description || "No description available",
              rating: null,
              page_count: book.pageCount || null,
              categories: book.categories || [],
              language: book.language || "N/A",
              publisher: book.publisher || "N/A",
              user_notes: "",
              shelf_id: null,
              shelf_location: null
            };
          } else {
            return {
              title: bookTitle,
              author: "Unknown",
              published_date: "N/A",
              isbn: "N/A",
              cover: null,
              description: "No description available",
              rating: null,
              user_notes: "",
              shelf_id: null,
              shelf_location: null,
              message: "No metadata found in Google Books"
            };
          }
        } catch (error) {
          console.error(`Error fetching metadata for "${bookTitle}":`, error);

          // Check for API key related errors
          if (error.response?.status === 403) {
            return {
              title: bookTitle,
              message: "API key error - please check your Google Books API key",
              error: error.message
            };
          }

          return {
            title: bookTitle,
            message: "Error fetching metadata",
            error: error.message
          };
        }
      })
    );

    res.status(200).json({
      message: "Metadata fetched successfully",
      books: bookMetadata
    });

  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({
      message: 'Failed to fetch book metadata.',
      error: error.toString()
    });
  }
};


exports.getAllBooks = async (req, res, next) => {
  try {
    const book = await Book.findAll();
    res.status(200).json({ count: book.length, book });
  } catch (error) {
    next(error);
  }
};

  
  exports.createBook = async (req, res, next) => {
    try {
        const {book_id, shelf_id, title, author, published_date, isbn, rating, description, cover, shelf_location } = req.body;
        const book = new Book (book_id, shelf_id, title, author, published_date, isbn, rating, description, cover, shelf_location);
        await book.save();
        res.status(201).json({ message: "Book created" });
    } catch (error) {
      next(error);
    }
  };
  
  exports.getBookById = async (req, res, next) => {
    try {
      const bookID = req.params.id;
      const book = await Book.findById(bookID);
      res.status(200).json({ book });
    } catch (error) {
      next(error);
    }
  };
  


  exports.updateBookById = async (req, res, next) => {
    try {
      const bookId = req.params.id;
      const { rating, user_notes, reading_status } = req.body;
      
      console.log('Updating book:', {
        bookId,
        rating,
        user_notes,
        reading_status
      });
  
      const updateData = {};
      if (rating !== undefined) updateData.rating = rating;
      if (user_notes !== undefined) updateData.user_notes = user_notes;
      if (reading_status !== undefined) updateData.reading_status = reading_status;
  
      const book = new Book(bookId);
      await book.update(updateData);
      
      res.status(200).json({ 
        message: "Book updated successfully",
        book: {
          book_id: bookId,
          ...updateData
        }
      });
    } catch (error) {
      console.error('Error in updateBookById:', error);
      next(error);
    }
  };

exports.getBookById = async (req, res, next) => {
  try {
    const bookID = req.params.id;
    const book = await Book.findById(bookID);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ book });
  } catch (error) {
    next(error);
  }
};

exports.getBooksByShelfId = async (req, res, next) => {
  try {
    const { shelfId } = req.params;
    const books = await Book.findByShelfId(shelfId);
    res.status(200).json({ books });
  } catch (error) {
    console.error('Error fetching books for shelf:', error);
    next(error);
  }
};

exports.updateReadingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const book = new Book(id);
    const updated = await book.updateReadingStatus(status);

    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ 
      message: "Reading status updated successfully",
      book_id: id,
      reading_status: status
    });
  } catch (error) {
    console.error('Error in updateReadingStatus:', error);
    next(error);
  }
};

exports.getBooksByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const books = await Book.findByReadingStatus(status);
    res.status(200).json({ books });
  } catch (error) {
    console.error('Error in getBooksByStatus:', error);
    next(error);
  }
};

exports.deleteBookById = async (req, res, next) => {
  try {
    const bookID = req.params.id;
    const result = await Book.deleteById(bookID);
    
    if (result) {
      res.status(200).json({ message: "Book deleted successfully" });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    next(error);
  }
};

exports.searchBooks = async (req, res, next) => {
  try {
    const { query } = req.query;
    console.log('Received search query:', query); // For debugging
    
    if (!query || query.trim().length === 0) {
      return res.status(200).json({ results: [] });
    }

    //Get all shelves first
    const shelvesQuery = "SELECT * FROM shelf";
    const [shelves] = await db.execute(shelvesQuery);

    //Search for books matching the query
    const searchQuery = `
      SELECT b.*, s.shelf_name 
      FROM book b
      LEFT JOIN shelf s ON b.shelf_id = s.shelf_id
      WHERE b.title LIKE ? OR b.author LIKE ?
    `;
    const searchPattern = `%${query}%`;
    const [books] = await db.execute(searchQuery, [searchPattern, searchPattern]);

    console.log('Found books:', books); // For debugging

    //Group books by shelf
    const results = shelves.map(shelf => ({
      id: shelf.shelf_id,
      name: shelf.shelf_name,
      books: books.filter(book => book.shelf_id === shelf.shelf_id)
    }));

    console.log('Grouped results:', results); // For debugging

    res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error);
    next(error);
  }
};

exports.addBatchBooks = async (req, res, next) => {
  try {
    const books = req.body;
    const savedBooks = [];

    console.log('Received books data:', books); // Debug log

    for (const bookData of books) {
      console.log('Processing book with shelf_id:', bookData.shelf_id); // Debug log

      if (!bookData.shelf_id) {
        console.error('Missing shelf_id for book:', bookData.title);
        continue; // Skip books without shelf_id
      }

      // Format and sanitize data
      const sanitizedBook = {
        shelf_id: bookData.shelf_id,
        title: bookData.title || '',
        author: bookData.author || 'Unknown',
        published_date: bookData.published_date || null,
        isbn: bookData.isbn || null,
        rating: bookData.rating === undefined ? null : bookData.rating,
        description: bookData.description || null,
        user_notes: bookData.user_notes || '',
        cover: bookData.cover || null,
        shelf_location: bookData.shelf_location || null
      };

      const book = new Book(
        null,
        sanitizedBook.shelf_id,
        sanitizedBook.title,
        sanitizedBook.author,
        sanitizedBook.published_date,
        sanitizedBook.isbn,
        sanitizedBook.rating,
        sanitizedBook.description,
        sanitizedBook.user_notes,
        sanitizedBook.cover,
        sanitizedBook.shelf_location
      );

      try {
        const bookId = await book.save();
        savedBooks.push({
          ...sanitizedBook,
          book_id: bookId
        });
        console.log(`Successfully saved book with ID: ${bookId} to shelf: ${sanitizedBook.shelf_id}`);
      } catch (error) {
        console.error(`Failed to save book "${bookData.title}":`, error);
      }
    }

    res.status(201).json({
      message: `Successfully added ${savedBooks.length} books`,
      books: savedBooks
    });
  } catch (error) {
    console.error('Error in batch book addition:', error);
    next(error);
  }
};