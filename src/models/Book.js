const db = require("../config/db");

class Book {
  constructor(books_id, title, author, isbn, shelf_location ) {
    this.books_id = books_id;
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.shelf_location = shelf_location;
  }

  async save() {
    try {
      const sql = `
        INSERT INTO books(
          books_id, title, author, isbn, shelf_location
        )
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [this.books_id, this.title, this.author, this.isbn, this.shelf_location];
      
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
            title = ?,
            author = ?,
            isbn = ?,
            shelf_location,
        WHERE id = ?
      `;
      const values = [this.books_id, this.title, this.author, this.isbn, this.shelf_location];
      
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

}

module.exports = Book;
