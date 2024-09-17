const db = require("../config/db");

class Shelf {
  constructor(shelf_id, shelf_name, shelf_description) {
    this.shelf_id = shelf_id;
    this.shelf_name = shelf_name;
    this.shelf_description = shelf_description;
  }

  async save() {
    try {
      const sql = `
        INSERT INTO shelfs(
          shelf_id, shelf_name, shelf_description
        )
        VALUES (?, ?, ?)
      `;
      const values = [this.shelf_id, this.shelf_name, this.shelf_description];
      
      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error saving shelfs: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const sql = "SELECT * FROM shelfs";
      const [rows] = await db.execute(sql);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching all shelfs: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = "SELECT * FROM shelfs WHERE id = ?";
      const [rows] = await db.execute(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching shelfs by id: ${error.message}`);
    }
  }

  async update() {
    try {
      const sql = `
        UPDATE shelfs
        SET shelf_id = ?,
            shelf_name = ?,
            shelf_description,
        WHERE id = ?
      `;
      const values = [this.shelf_id, this.shelf_name, this.shelf_description];
      
      await db.execute(sql, values);
    } catch (error) {
      throw new Error(`Error updating shelfs: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'shelfs';
    const bookTableName = 'books';
    try {
      // Delete the row
      const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;
      const deleteBookQuery = `DELETE FROM ${bookTableName} WHERE book_detections = ?`;
      
      
      await db.execute(deleteBookQuery, [id]);
      await db.execute(deleteQuery, [id]);

      // Re-index the table
      await this.reindexTable();

      console.log(`Deleted row with ID ${id} from ${tableName} table`);
    } catch (error) {
      console.error(`Error deleting row with ID ${id} from ${tableName} table:`, error);
    }
  }

  static async reindexTable() {
    const tableName = 'shelfs'; 
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

module.exports = Shelf;