const db = require("../config/db");

class Performance {
  constructor(performance_id, model_used, detection_count, accuracy, avg_response_time, session_time) {
    this.performance_id = performance_id;
    this.model_used = model_used;
    this.detection_count = detection_count;
    this.accuracy = accuracy;
    this.avg_response_time = avg_response_time;
    this.session_time = session_time;
  }

  async save() {
    try {
      const sql = `
        INSERT INTO ai_performance(
          performance_id, model_used, detection_count, accuracy, avg_response_time, session_time
        )
        VALUES (?, ?, ?, ?)
      `;
      const values = [this.performance_id, this.model_used, this.detection_count, this.accuracy, this.avg_response_time, this.session_time];
      
      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error saving ai_performance: ${error.message}`);
    }
  }

  static async findAll() {
    try {
        const sql = "SELECT * FROM ai_performance";
        const [rows] = await db.execute(sql);
        return rows;
    } catch (error) {
      throw new Error(`Error fetching all metrics: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
        const sql = "SELECT * FROM ai_performance WHERE id = ?";
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    } catch (error) {
      throw new Error(`Error fetching ai_performance by id: ${error.message}`);
    }
  }

  async update() {
    try {
        const sql = `
        UPDATE books
        SET performance_id = ?,
            model_used = ?,
            detection_count = ?,
            accuracy = ?,
            avg_response_time = ?,
            session_time = ?
        WHERE id = ?
      `;
      const values = [this.performance_id, this.model_used, this.detection_count, this.accuracy, this.avg_response_time, this.session_time];
      
      await db.execute(sql, values);
    } catch (error) {
      throw new Error(`Error updating ai_performance: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'ai_performance';
    try {
      // Delete the row
      const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;

      await db.execute(deleteQuery, [id]);

      // Re-index the table
      await this.reindexTable();

      console.log(`Deleted row with ID ${id} from ${tableName} table`);
    } catch (error) {
      console.error(`Error deleting row with ID ${id} from ${tableName} table:`, error);
    }
  }

  static async reindexTable() {
    const tableName = 'ai_performance'; 
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

module.exports = Performance;
