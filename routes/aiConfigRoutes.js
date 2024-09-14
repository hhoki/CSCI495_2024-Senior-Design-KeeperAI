const express = require("express");
const aiConfigController = require("../controllers/aiConfigController");
const router = express.Router();

router
  .route("/")
  .get(aiConfigController.getAllAiConfig)
  .post(aiConfigController.createAiConfig);

router
  .route("/:id")
  .get(aiConfigController.getAiConfigById)
  .patch(aiConfigController.updateAiConfigById)
  .delete(aiConfigController.deleteAiConfigById);

module.exports = router;