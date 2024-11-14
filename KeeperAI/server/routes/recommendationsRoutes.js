// recommendationsRoutes.js
const express = require("express");
const recommendationsController = require("../controllers/recommendationsController");
const router = express.Router();

router.get("/", recommendationsController.getRecommendations);

module.exports = router;