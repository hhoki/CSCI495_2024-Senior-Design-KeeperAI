const express = require("express");
const multer = require('multer');
const path = require('path');
const bookController = require("../controllers/bookController");
const fs = require('fs').promises;
const router = express.Router();

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    const coversDir = path.join(uploadDir, 'covers');

    try {
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.mkdir(coversDir, { recursive: true });
      cb(null, coversDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});


router
  .get('/search', bookController.searchBooks);


router
  .route("/")
  .get(bookController.getAllBooks)
  .post(bookController.createBook)
  
router
  .post('/detect', upload.single('bookImage'), bookController.detectBooks);

router
  .post('/:id/cover', upload.single('cover'), bookController.uploadCover);

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