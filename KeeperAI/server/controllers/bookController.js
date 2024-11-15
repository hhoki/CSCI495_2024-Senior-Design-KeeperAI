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
    console.log('File details:', {
      path: filePath,
      mimeType: mimeType,
      originalName: req.file.originalname
    });

    // Generate content directly from the uploaded file
    const bookTitles = await Book.generateContentFromImage(
      null,  // We're not using the fileUri anymore
      mimeType,
      filePath
    );

    console.log('Detected book titles:', bookTitles);

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

    const bookMetadata = await Promise.all(
      bookTitles.map(async (bookTitle) => {
        try {
          const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}&key=${process.env.GOOGLE_BOOKS_API_KEY}&maxResults=1`;
          console.log('Fetching from Google Books:', bookTitle);
          const response = await axios.get(googleBooksUrl);

          if (response.data.items && response.data.items.length > 0) {
            const book = response.data.items[0].volumeInfo;

            // Log the raw categories data for debugging
            console.log('Raw categories for', bookTitle, ':', book.categories);

            // Simply use the categories array directly
            const categories = book.categories || [];

            // Enhanced cover image handling
            let coverUrl = null;
            if (book.imageLinks) {
              coverUrl = book.imageLinks.extraLarge ||
                book.imageLinks.large ||
                book.imageLinks.medium ||
                book.imageLinks.small ||
                book.imageLinks.thumbnail;

              if (coverUrl) {
                coverUrl = coverUrl
                  .replace('http://', 'https://')
                  .replace('zoom=1', 'zoom=3')
                  .replace('&edge=curl', '');
              }
            }

            return {
              title: book.title || bookTitle,
              author: book.authors ? book.authors[0] : "Unknown",
              published_date: book.publishedDate || "N/A",
              isbn: book.industryIdentifiers ?
                book.industryIdentifiers.find(id => id.type === "ISBN_13")?.identifier ||
                book.industryIdentifiers.find(id => id.type === "ISBN_10")?.identifier ||
                "N/A" : "N/A",
              cover: coverUrl,
              description: book.description || "No description available",
              genres: categories,  // Use the raw categories array
              rating: null,
              page_count: book.pageCount || null,
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
              cover: `https://via.placeholder.com/300x450/e0e0e0/333333?text=${encodeURIComponent(bookTitle)}`,
              description: "No description available",
              genres: [],
              rating: null,
              user_notes: "",
              shelf_id: null,
              shelf_location: null
            };
          }
        } catch (error) {
          console.error(`Error fetching metadata for "${bookTitle}":`, error);
          return {
            title: bookTitle,
            message: "Error fetching metadata",
            error: error.message,
            cover: `https://via.placeholder.com/300x450/e0e0e0/333333?text=${encodeURIComponent(bookTitle)}`,
            genres: []
          };
        }
      })
    );

    console.log('Successfully processed books with genres');
    res.status(200).json({
      message: "Metadata fetched successfully",
      books: bookMetadata
    });

  } catch (error) {
    console.error('Error in fetchOpenLibraryMetadata:', error);
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
    const updates = req.body;

    console.log('Updating book:', { bookId, updates });

    const allowedFields = [
      'shelf_id',  // Add this to allowed fields
      'title',
      'author',
      'description',
      'published_date',
      'isbn',
      'rating',
      'user_notes',
      'cover',
      'shelf_location',
      'reading_status',
      'publisher',
      'page_count'
    ];

    const updateFields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid update fields provided' });
    }

    values.push(bookId);  // Add bookId for WHERE clause

    const sql = `
      UPDATE book 
      SET ${updateFields.join(', ')}
      WHERE book_id = ?
    `;

    console.log('Update SQL:', sql);
    console.log('Update values:', values);

    const [result] = await db.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Fetch updated book
    const [updatedBook] = await db.execute(
      'SELECT * FROM book WHERE book_id = ?',
      [bookId]
    );

    res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook[0]
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

    console.log('Received books data:', books);

    for (const bookData of books) {
      console.log('Processing book:', bookData.title);
      console.log('Book genres before processing:', bookData.genres);

      if (!bookData.shelf_id) {
        console.error('Missing shelf_id for book:', bookData.title);
        continue;
      }

      // Create sanitized book data with explicit genres handling
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
        shelf_location: bookData.shelf_location || null,
        genres: Array.isArray(bookData.genres) ? bookData.genres : [] // Ensure genres is always an array
      };

      console.log('Sanitized book data:', sanitizedBook);

      try {
        const book = new Book(
          null,  // book_id
          sanitizedBook.shelf_id,
          sanitizedBook.title,
          sanitizedBook.author,
          sanitizedBook.published_date,
          sanitizedBook.isbn,
          sanitizedBook.rating,
          sanitizedBook.description,
          sanitizedBook.user_notes,
          sanitizedBook.cover,
          sanitizedBook.shelf_location,
          sanitizedBook.genres  // Pass genres explicitly
        );

        console.log('Created book object with genres:', book.genres);

        const bookId = await book.save();
        console.log(`Saved book with ID ${bookId} and genres:`, book.genres);

        savedBooks.push({
          ...sanitizedBook,
          book_id: bookId,
          genres: book.genres // Ensure genres are included in response
        });

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

const ensureUploadDirs = async () => {
  const uploadDir = path.join(__dirname, '../uploads');
  const coversDir = path.join(uploadDir, 'covers');

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(coversDir, { recursive: true });
    console.log('Upload directories created/verified');
  } catch (error) {
    console.error('Error creating upload directories:', error);
    throw error;
  }
};

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded.'
      });
    }

    const bookId = req.params.id;

    // Create the relative path that will be stored in the database
    const relativePath = `/uploads/covers/${req.file.filename}`;

    // Create both storage path and public URL
    const serverUrl = process.env.NODE_ENV === 'production'
      ? process.env.SERVER_URL
      : 'http://localhost:5000';

    const fullUrl = `${serverUrl}${relativePath}`;

    console.log('File saved at:', req.file.path);
    console.log('Public URL will be:', fullUrl);
    console.log('Relative path stored in DB:', relativePath);

    const sql = `
      UPDATE book 
      SET cover = ?
      WHERE book_id = ?
    `;

    const [result] = await db.execute(sql, [relativePath, bookId]);

    if (result.affectedRows === 0) {
      // Clean up the uploaded file if book not found
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({
      message: 'Cover uploaded successfully',
      coverUrl: relativePath // Send back the relative path
    });

  } catch (error) {
    console.error('Error uploading cover:', error);
    // Clean up the uploaded file in case of error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(error);
  }
};