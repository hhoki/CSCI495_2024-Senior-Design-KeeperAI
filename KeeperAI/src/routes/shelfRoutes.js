const express = require("express");
const shelfController = require("../controllers/shelfController");
const router = express.Router();

//TODO: potential syntax arrors with database. May need to rename

router
  .route("/")
  .get(shelfController.getAllShelfs)
  .post(shelfController.createShelf)
 // .post('/upload', upload.single('shelf'), shelfController.detectShelf);


  
router
  .route("/:id")
  .get(shelfController.getShelfById)
  .patch(shelfController.updateShelfById)
  .delete(shelfController.deleteShelfById);

module.exports = router;