const db = require("../config/db");
const path = require('path');
//Google Gemini Configurations and Libraries
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
//Replace in .env with your api key
const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

class Book {
  constructor(books_id, shelfs_id, title, author, published_date, isbn, rating, description, cover, shelf_location) {
    this.books_id = books_id;
    this.shelfs_id = shelfs_id;
    this.title = title;
    this.author = author;
    this.published_date = published_date;
    this.isbn = isbn;
    this.rating = rating;
    this.description = description;
    this.cover = cover;
    this.shelf_location = shelf_location;
  }

  async save() {
    try {
      const sql = `
        INSERT INTO books(
          books_id, shelfs_id, title, author, published_date, isbn, rating, description, cover, shelf_location
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [this.books_id, this.shelfs_id, this.title, this.author, this.published_date, this.isbn, this.rating, this.description, this.cover, this.shelf_location];

      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error saving book: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const sql = "SELECT * FROM books";
      const [rows] = await db.execute(sql);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching all books: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = "SELECT * FROM books WHERE id = ?";
      const [rows] = await db.execute(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching book by id: ${error.message}`);
    }
  }

  async update() {
    try {
      const sql = `
        UPDATE books
        SET books_id = ?,
            shelfs_id = ?,
            title = ?,
            author = ?,
            published_date = ?,
            isbn = ?,
            rating = ?,
            cover = ?,
            shelf_location,
        WHERE id = ?
      `;
      const values = [this.books_id, this.shelfs_id, this.title, this.author, this.published_date, this.isbn, this.rating, this.description, this.cover, this.shelf_location];

      await db.execute(sql, values);
    } catch (error) {
      throw new Error(`Error updating book: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'books';
    const detectionTableName = 'book_detections';
    try {
      // Delete the row
      const deleteQuery = `DELETE FROM ${tableName} JOIN ${detectionTableName} on ${tableName}.books_id = ${detectionTableName}.book_id WHERE id = ?`;
      await db.execute(deleteQuery, [id]);
      // Re-index the table
      await this.reindexTable();

      console.log(`Deleted row with ID ${id} from ${tableName} table`);
    } catch (error) {
      console.error(`Error deleting row with ID ${id} from ${tableName} table:`, error);
    }
  }

  static async reindexTable() {
    const tableName = 'books';
    try {
      // Get all rows from the table sorted by ID
      const query = `SELECT * FROM ${tableName} ORDER BY id`;
      const [rows] = await db.execute(query);

      // Update IDs sequentially starting from 1
      let index = 1;
      for (const row of rows) {
        const updateQuery = `UPDATE ${tableName} SET id = ? WHERE id = ?`;
        await db.execute(updateQuery, [index, row.id]);
        index++;
      }

      console.log(`Re-indexing ${tableName} table completed successfully`);
    } catch (error) {
      console.error(`Error re-indexing ${tableName} table:`, error);
    }
  }


  static async uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }

  static async generateContent(file) {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
  });
    const chatSession = model.startChat({
      generationConfig});
    const result = await chatSession.sendMessage("Tell me the titles of these books. Don't record authors");
    return result.response.text();
  }
}

module.exports = Book;
