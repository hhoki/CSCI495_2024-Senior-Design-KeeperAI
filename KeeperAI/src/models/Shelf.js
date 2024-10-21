const db = require("../config/db");

class Shelf {
  constructor(shelf_id, shelf_name, shelf_description) {
    this.shelf_id = shelf_id;
    this.shelf_name = shelf_name;
    this.shelf_description = shelf_description;
  }

  async save() {
    try {
      console.log('Saving shelf:', this);
      const sql = `
        INSERT INTO shelf (shelf_name, shelf_description)
        VALUES (?, ?)
      `;
      const values = [this.shelf_name, this.shelf_description];
      
      const [result] = await db.execute(sql, values);
      console.log('Save result:', result);
      
      return result.insertId;
    } catch (error) {
      console.error('Error saving shelf:', error);
      throw new Error(`Error saving shelf: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      console.log('Executing findAll method');
      const sql = "SELECT * FROM shelf";
      console.log('SQL query:', sql);
      const [rows] = await db.execute(sql);
      console.log('Rows retrieved from database:', rows);
      return rows.map(row => new Shelf(row.shelf_id, row.shelf_name, row.shelf_description));
    } catch (error) {
      console.error('Error in Shelf.findAll:', error);
      throw new Error(`Failed to fetch shelves: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = "SELECT * FROM shelf WHERE id = ?";
      const [rows] = await db.execute(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching shelf by id: ${error.message}`);
    }
  }

  async update() {
    try {
      const sql = `
        UPDATE shelf
        SET shelf_id = ?,
            shelf_name = ?,
            shelf_description,
        WHERE id = ?
      `;
      const values = [this.shelf_id, this.shelf_name, this.shelf_description];
      
      await db.execute(sql, values);
    } catch (error) {
      throw new Error(`Error updating shelf: ${error.message}`);
    }
  }

  static async deleteById(id) {
    try {
      console.log('Deleting shelf with ID:', id);
      const sql = "DELETE FROM shelf WHERE shelf_id = ?";
      const [result] = await db.execute(sql, [id]);
      
      console.log('Delete operation result:', result);
      
      if (result.affectedRows === 0) {
        throw new Error('No shelf found with the given ID');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting shelf:', error);
      throw new Error(`Failed to delete shelf: ${error.message}`);
    }
  }

  static async reindexTable() {
    const tableName = 'shelf'; 
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