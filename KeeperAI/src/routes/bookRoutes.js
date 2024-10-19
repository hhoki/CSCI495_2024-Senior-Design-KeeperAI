const express = require("express");
const multer = require('multer');
const path = require('path');
const bookController = require("../controllers/bookController");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(bookController.createBook)
  
router
  .post("/upload", upload.single('file'), bookController.detectBooks);

router
  .route("/:id")
  .get(bookController.getBookById)
  .patch(bookController.updateBookById)
  .delete(bookController.deleteBookById);

module.exports = router;