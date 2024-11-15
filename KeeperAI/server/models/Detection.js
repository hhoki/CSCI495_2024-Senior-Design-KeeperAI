const db = require("../config/db");

class Detection {
  constructor(detection_id, detection_time, image_path, model_used, book_id) {
    this.detection_id = detection_id;
    this.detection_time = detection_time;
    this.image_path = image_path;
    this.model_used = model_used;
    this.book_id = book_id;
  }

  async save() {
    try {
      const sql = `
        INSERT INTO book_detections(
          detection_id, detection_time, image_path, model_used, book_id
        )
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [this.detection_id, this.detection_time, this.image_path, this.model_used, this.book_id];
      
      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error saving book_detections: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const sql = "SELECT * FROM book_detections";
      const [rows] = await db.execute(sql);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching all book_detections: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = "SELECT * FROM book_detections WHERE id = ?";
      const [rows] = await db.execute(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching book_detections by id: ${error.message}`);
    }
  }

  async update() {
    try {
      const sql = `
        UPDATE book
        SET detection_id = ?,
            detection_time = ?,
            image_path = ?,
            model_used = ?,
            book_id,
        WHERE id = ?
      `;
      const values = [this.detection_id, this.detection_time, this.image_path, this.model_used, this.book_id];
      
      await db.execute(sql, values);
    } catch (error) {
      throw new Error(`Error updating book_detections: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'book_detections';
    const bookTableName = 'book';
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
    const tableName = 'book_detections'; 
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

module.exports = Detection;
