const axios = require('axios');
const Detection = require('../models/Detection');

exports.getAllDetections = async (req, res, next) => {
    try {
    const detections = await Detection.findAll();
    res.status(200).json({ count: detections.length, detections });
    } catch (error) {
      next(error);
    }
  };
  
  exports.createDetection = async (req, res, next) => {
    try {
      const {detection_id, detection_time, image_path, model_used, book_id } = req.body;
      const detections = new Detection(detection_id, detection_time, image_path, model_used, book_id);
      await detections.save();
      res.status(201).json({ message: "Detection created" });
    } catch (error) {
      next(error);
    }
  };
  
  exports.getDetectionById = async (req, res, next) => {
    try {
      const detectionId = req.params.id;
      const detection = await Detection.findById(detectionId);
      res.status(200).json({detection})
    } catch (error) {
      next(error);
    }
  };
  
  exports.updateDetectionById = async (req, res, next) => {
    try {
      const detectionId = req.params.id;
    const { detection_id, detection_time, image_path, model_used, book_id } = req.body;
    const detection = new Detection(detection_id, detection_time, image_path, model_used, book_id);
    detection.id = detectionId;
    await detection.update();
    } catch (error) {
      next(error);
    }
  };
  
  exports.deleteDetectionById = async (req, res, next) => {
    try {
    const detectionId = req.params.id;
    await Detection.deleteById(detectionId);
    } catch (error) {
      next(error);
    }
  };

