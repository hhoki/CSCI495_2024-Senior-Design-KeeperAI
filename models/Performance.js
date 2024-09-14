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
        INSERT INTO book_detections(
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
      
    } catch (error) {
      throw new Error(`Error fetching all metrics: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      
    } catch (error) {
      throw new Error(`Error fetching ai_performance by id: ${error.message}`);
    }
  }

  async update() {
    try {
      
    } catch (error) {
      throw new Error(`Error updating ai_performance: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'ai_performance';
    const careplanTableName = 'careplan';
    try {
      ;
    } catch (error) {
      console.error(`Error deleting row with ID ${id} from ${tableName} table:`, error);
    }
  }

  static async reindexTable() {
    const tableName = 'ai_performance'; 
    try {
      
    } catch (error) {
      console.error(`Error re-indexing ${tableName} table:`, error);
    }
  }

}

module.exports = Performance;