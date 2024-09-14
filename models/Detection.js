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
      
    } catch (error) {
      throw new Error(`Error fetching all book_detections: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      
    } catch (error) {
      throw new Error(`Error fetching book_detections by id: ${error.message}`);
    }
  }

  async update() {
    try {
      
    } catch (error) {
      throw new Error(`Error updating book_detections: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'book_detections';
    try {
      ;
    } catch (error) {
      console.error(`Error deleting row with ID ${id} from ${tableName} table:`, error);
    }
  }

  static async reindexTable() {
    const tableName = 'book_detections'; 
    try {
      
    } catch (error) {
      console.error(`Error re-indexing ${tableName} table:`, error);
    }
  }

}

module.exports = Detection;
