const express = require("express");
const shelfController = require("../controllers/shelfController");
const router = express.Router();

router
  .route("/")
  .get(shelfController.getAllShelves)
  .post(shelfController.createShelf);

router
  .route("/:id")
  .get(shelfController.getShelfById)
  .patch(shelfController.updateShelfById)
  .delete(shelfController.deleteShelfById);

module.exports = router;