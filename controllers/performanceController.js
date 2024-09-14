const axios = require('axios');
const bookModel = require('../models/Performance');

exports.getAllMetrics = async (req, res, next) => {
    try {
      
    } catch (error) {
      next(error);
    }
  };
  
  exports.createMetric = async (req, res, next) => {
    try {
      
    } catch (error) {
      next(error);
    }
  };
  
  exports.getMetricById = async (req, res, next) => {
    try {
      
    } catch (error) {
      next(error);
    }
  };
  
  exports.updateMetricById = async (req, res, next) => {
    try {
      
    } catch (error) {
      next(error);
    }
  };
  
  exports.deleteMetricById = async (req, res, next) => {
    try {
      
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