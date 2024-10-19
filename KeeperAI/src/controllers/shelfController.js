const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Book = require('../models/Shelf');
const Shelf = require('../models/Shelf');

exports.getAllShelves = async (req, res, next) => {
  try {
    const shelves = await Shelf.findAll();
    res.status(200).json({ count: shelves.length, shelves });
  } catch (error) {
    next(error);
  }
};

exports.createShelf = async (req, res, next) => {
  try {
    const { shelf_name, shelf_description } = req.body;
    const shelf = new Shelf(null, shelf_name, shelf_description);
    const newShelfId = await shelf.save();
    res.status(201).json({ message: "Shelf created", shelfId: newShelfId });
  } catch (error) {
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
    const shelfId = req.params.id;
    await Shelf.deleteById(shelfId);
    res.status(200).json({ message: "Shelf deleted" });
  } catch (error) {
    next(error);
  }
};