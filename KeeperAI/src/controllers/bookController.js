const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const fs = require('fs').promises;

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

    //Prepare the file for Gemini
    const fileData = await Book.uploadToGemini(filePath, mimeType);
    console.log('File prepared for Gemini');

    //Generate content using Gemini
    const resultText = await Book.generateContent(fileData);
    console.log('Gemini result:', resultText);

    res.json({ result: resultText });
  } catch (error) {
    console.error('Error during book detection:', error);
    res.status(500).json({ message: 'Failed to detect books from the image.', error: error.toString() });
  } finally {
    //Clean up the uploaded file
    const fs = require('fs').promises;
    await fs.unlink(filePath).catch(console.error);
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

exports.deleteBookById = async (req, res, next) => {
  try {
    const bookID = req.params.id;
    await Book.deleteById(bookID);
    res.status(200).json({ message: "Book deleted" });
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
