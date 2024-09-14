const db = require("../config/db");

class Book {
  constructor(books_id, title, author, isbn, shelf_location, date_added ) {
    this.books_id = books_id;
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.shelf_location = shelf_location;
    this.date_added = date_added;
  }

  async save() {
    try {
      const sql = `
        INSERT INTO books(
          books_id, title, author, isbn, shelf_location, date_added
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [this.books_id, this.title, this.author, this.isbn, this.shelf_location, this.date_added];
      
      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error saving book: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      
    } catch (error) {
      throw new Error(`Error fetching all books: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      
    } catch (error) {
      throw new Error(`Error fetching book by id: ${error.message}`);
    }
  }

  async update() {
    try {
      
    } catch (error) {
      throw new Error(`Error updating book: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'books';
    try {
      ;
    } catch (error) {
      console.error(`Error deleting row with ID ${id} from ${tableName} table:`, error);
    }
  }

  static async reindexTable() {
    const tableName = 'books'; 
    try {
      
    } catch (error) {
      console.error(`Error re-indexing ${tableName} table:`, error);
    }
  }

}

module.exports = Book;
