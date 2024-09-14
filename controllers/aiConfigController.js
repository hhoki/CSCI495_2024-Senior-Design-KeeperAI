const axios = require('axios');
const AI_Config = require('../models/AI_Config');

exports.getAllAiConfig = async (req, res, next) => {
    try {
      const configs = await AI_Config.findAll();
    res.status(200).json({ count: configs.length, configs });
    } catch (error) {
      next(error);
    }
  };
  
  exports.createAiConfig = async (req, res, next) => {
    try {
      const { config_id, model_used, version, config_params } = req.body;
    const configs = new AI_Config(config_id, model_used, version, config_params);
    await configs.save();
    res.status(201).json({ message: "Model Config created" });
    } catch (error) {
      next(error);
    }
  };
  
  exports.getAiConfigById = async (req, res, next) => {
    try {
      
    } catch (error) {
      next(error);
    }
  };
  
  exports.updateAiConfigById = async (req, res, next) => {
    try {
      
    } catch (error) {
      next(error);
    }
  };
  
  exports.deleteAiConfigById = async (req, res, next) => {
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