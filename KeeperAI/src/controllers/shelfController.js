const axios = require('axios');
const Book = require('../models/Book');

exports.getAllShelfs = async (req, res, next) => {
    try {
    const books = await Book.findAll();
    res.status(200).json({ count: shelfs.length, shelfs });
    } catch (error) {
      next(error);
    }
  };
  
  exports.createShelf = async (req, res, next) => {
    try {
        const {shelf_id, shelf_name, shelf_description } = req.body;
        const shelfs = new shelf_id, shelf_name, shelf_description);
        await shelfs.save();
        res.status(201).json({ message: "Shelf created" });
    } catch (error) {
      next(error);
    }
  };
  
  exports.getShelfById = async (req, res, next) => {
    try {
      const shelfID = req.params.id;
      const shelf = await Shelf.findById(shelfID);
      res.status(200).json({ shelf });
    } catch (error) {
      next(error);
    }
  };
  
  exports.updateShelfById = async (req, res, next) => {
    try {
    const shelfID = req.params.id;
    const { shelf_id, shelf_name, shelf_description} = req.body;
    const shelf = new Shelf(shelf_id, shelf_name, shelf_description);
    shelf.id = shelfID;
    await shelf.update();
    res.status(200).json({ message: "Shelf updated" });
    } catch (error) {
      next(error);
    }
  };
  
  exports.deleteShelfById = async (req, res, next) => {
    try {
    const shelfID = req.params.id;
    await Shelf.deleteById(bookID);
    res.status(200).json({ message: "Shelf deleted" });
    } catch (error) {
      next(error);
    }
  };
