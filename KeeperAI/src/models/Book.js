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
  constructor(book_id, shelf_id, title, author, published_date, isbn, rating, description, cover, shelf_location) {
    this.book_id = book_id;
    this.shelf_id = shelf_id;
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
        INSERT INTO book(
          book_id, shelf_id, title, author, published_date, isbn, rating, description, cover, shelf_location
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [this.book_id, this.shelf_id, this.title, this.author, this.published_date, this.isbn, this.rating, this.description, this.cover, this.shelf_location];

      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error saving book: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const sql = "SELECT * FROM book";
      const [rows] = await db.execute(sql);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching all book: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = "SELECT * FROM book WHERE id = ?";
      const [rows] = await db.execute(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching book by id: ${error.message}`);
    }
  }

  static async findAllBookByShelfId(id) {
    try {
      const sql = "SELECT * FROM book WHERE shelf_id = ?";
      const [rows] = await db.execute(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching book by id: ${error.message}`);
    }
  }

  async update() {
    try {
      const sql = `
        UPDATE book
        SET book_id = ?,
            shelf_id = ?,
            title = ?,
            author = ?,
            published_date = ?,
            isbn = ?,
            rating = ?,
            cover = ?,
            shelf_location,
        WHERE id = ?
      `;
      const values = [this.book_id, this.shelf_id, this.title, this.author, this.published_date, this.isbn, this.rating, this.description, this.cover, this.shelf_location];

      await db.execute(sql, values);
    } catch (error) {
      throw new Error(`Error updating book: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'book';
    const detectionTableName = 'book_detections';
    try {
      // Delete the row
      const deleteQuery = `DELETE FROM ${tableName} JOIN ${detectionTableName} on ${tableName}.book_id = ${detectionTableName}.book_id WHERE id = ?`;
      await db.execute(deleteQuery, [id]);
      // Re-index the table
      await this.reindexTable();

      console.log(`Deleted row with ID ${id} from ${tableName} table`);
    } catch (error) {
      console.error(`Error deleting row with ID ${id} from ${tableName} table:`, error);
    }
  }

  static async reindexTable() {
    const tableName = 'book';
    try {
      //Get all rows from the table sorted by ID
      const query = `SELECT * FROM ${tableName} ORDER BY id`;
      const [rows] = await db.execute(query);

      //Update IDs sequentially starting from 1
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
    const fs = require('fs').promises;
    const imageData = await fs.readFile(path);
    return {
      inlineData: {
        data: imageData.toString('base64'),
        mimeType: mimeType
      }
    };
  }

  static async generateContent(file) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = "Analyze this image and tell me the titles of the books you see. List only the titles, not the authors.";
    
    const result = await model.generateContent([prompt, file]);
    const response = await result.response;
    return response.text();
  }
}

module.exports = Book;
