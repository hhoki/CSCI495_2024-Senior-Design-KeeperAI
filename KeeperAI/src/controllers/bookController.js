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
    const bookID = req.params.id;
    const { book_id, shelf_id, title, author, published_date, isbn, rating, description, cover, shelf_location } = req.body;
    const book = new Book(book_id, shelf_id, title, author, published_date, isbn, rating, description, cover, shelf_location);
    book.id = bookID;
    await book.update();
    res.status(200).json({ message: "Book updated" });
  } catch (error) {
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
