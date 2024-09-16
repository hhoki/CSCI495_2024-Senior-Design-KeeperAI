const express = require("express");
const multer = require('multer'); 
const bookController = require("../controllers/bookController");
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(bookController.createBook)
  //.post('/upload', upload.single('image'), bookController.detectBook);

router
  .route("/:id")
  .get(bookController.getBookById)
  .patch(bookController.updateBookById)
  .delete(bookController.deleteBookById);

module.exports = router;