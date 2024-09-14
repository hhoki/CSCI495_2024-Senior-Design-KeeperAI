const express = require("express");
const performanceController = require("../controllers/performanceController");
const router = express.Router();

router
  .route("/")
  .get(performanceController.getAllMetrics)
  .post(performanceController.createMetric);

router
  .route("/:id")
  .get(performanceController.getMetricById)
  .patch(performanceController.updateMetricById)
  .delete(performanceController.deleteMetricById);

module.exports = router;