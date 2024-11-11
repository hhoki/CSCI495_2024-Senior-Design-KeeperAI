const express = require('express');
const placeholderController = require('../controllers/placeholderController');
const router = express.Router();

// Route for generating placeholders: /placeholder/300/450?text=Book%20Title
router.get('/:width/:height', placeholderController.generatePlaceholder);

module.exports = router;