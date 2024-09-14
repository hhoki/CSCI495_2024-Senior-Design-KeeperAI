const express = require("express");
const detectionController = require("../controllers/detectionController");
const router = express.Router();

router
  .route("/")
  .get(detectionController.getAllDetections)
  .post(detectionController.createDetection);

router
  .route("/:id")
  .get(detectionController.getDetectionById)
  .patch(detectionController.updateDetectionById)
  .delete(detectionController.deleteDetectionById);

module.exports = router;