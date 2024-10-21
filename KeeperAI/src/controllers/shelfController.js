const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');
const Shelf = require('../models/Shelf');

exports.getAllShelves = async (req, res, next) => {
  try {
    const shelves = await Shelf.findAll();
    console.log('Retrieved shelves:', shelves);
    res.status(200).json({ 
      shelves: shelves.map(shelf => ({
        id: shelf.shelf_id, //Ensure this is the correct property name
        shelf_id: shelf.shelf_id, //Include both for compatibility
        name: shelf.shelf_name,
        description: shelf.shelf_description
      }))
    });
  } catch (error) {
    console.error('Error in getAllShelves:', error);
    next(error);
  }
};

exports.createShelf = async (req, res, next) => {
  try {
    console.log('Received request to create shelf:', req.body);
    const { shelf_name, shelf_description } = req.body;
    
    if (!shelf_name) {
      return res.status(400).json({ message: "Shelf name is required" });
    }

    const shelf = new Shelf(null, shelf_name, shelf_description);
    const newShelfId = await shelf.save();
    
    console.log('New shelf created with ID:', newShelfId);
    res.status(201).json({ 
      message: "Shelf created", 
      shelf: {
        id: newShelfId,
        name: shelf_name,
        description: shelf_description
      }
    });
  } catch (error) {
    console.error('Error in createShelf:', error);
    next(error);
  }
};

exports.getShelfById = async (req, res, next) => {
  try {
    const shelfId = req.params.id;
    const shelf = await Shelf.findById(shelfId);
    if (!shelf) {
      return res.status(404).json({ message: "Shelf not found" });
    }
    res.status(200).json({ shelf });
  } catch (error) {
    next(error);
  }
};

exports.updateShelfById = async (req, res, next) => {
  try {
    const shelfId = req.params.id;
    const { shelf_name, shelf_description } = req.body;
    const shelf = new Shelf(shelfId, shelf_name, shelf_description);
    await shelf.update();
    res.status(200).json({ message: "Shelf updated" });
  } catch (error) {
    next(error);
  }
};

exports.deleteShelfById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete shelf with ID:', id);
    
    //Delete associated books first
    await Book.deleteByShelfId(id);
    
    const result = await Shelf.deleteById(id);
    
    if (result) {
      console.log('Shelf and associated books deleted successfully');
      res.status(200).json({ message: "Shelf and associated books deleted successfully" });
    } else {
      console.log('No shelf found with the given ID');
      res.status(404).json({ message: "No shelf found with the given ID" });
    }
  } catch (error) {
    console.error('Error in deleteShelfById:', error);
    next(error);
  }
};