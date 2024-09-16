const axios = require('axios');
const Book = require('../models/Book');

exports.getAllBooks = async (req, res, next) => {
    try {
    const books = await Book.findAll();
    res.status(200).json({ count: books.length, books });
    } catch (error) {
      next(error);
    }
  };
  
  exports.createBook = async (req, res, next) => {
    try {
        const { books_id, title, author, isbn, shelf_location } = req.body;
        const books = new Book(books_id, title, author, isbn, shelf_location);
        await books.save();
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
    const { books_id, title, author, isbn, shelf_location} = req.body;
    const book = new Book(books_id, title, author, isbn, shelf_location);
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




exports.detectBook = async (req, res) => {
    try {
        
    } catch (error) {
        console.error('Error during book detection:', error);
        res.status(500).json({ message: 'Failed to detect books from the image.' });
    }
};