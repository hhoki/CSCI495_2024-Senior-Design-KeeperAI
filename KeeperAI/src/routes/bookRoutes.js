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
  .get('/search', bookController.searchBooks);


router
  .route("/")
  .get(bookController.getAllBooks)
  .post(bookController.createBook)
  
router
  .post('/detect', upload.single('bookImage'), bookController.detectBooks);

router
  .post('/batch', bookController.addBatchBooks);


router
  .post('/metadata', bookController.fetchOpenLibraryMetadata);

router
  .route("/:id")
  .get(bookController.getBookById)
  .patch(bookController.updateBookById)
  .delete(bookController.deleteBookById);

router
  .get("/shelf/:shelfId", bookController.getBooksByShelfId);


module.exports = router;