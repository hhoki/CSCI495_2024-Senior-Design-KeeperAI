const db = require("../config/db");

class AI_Config {
  constructor(config_id, model_used, version, config_params) {
    this.config_id = config_id;
    this.model_used = model_used;
    this.version = version;
    this.config_params = config_params;
  }

  async save() {
    try {
      const sql = `
        INSERT INTO model_configurations(
          config_id, model_used, version, config_params
        )
        VALUES (?, ?, ?, ?)
      `;
      const values = [this.config_id, this.model_used, this.version, this.config_params];
      
      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error saving config: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const sql = "SELECT * FROM model_configurations";
      const [rows] = await db.execute(sql);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching all configs: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      
    } catch (error) {
      throw new Error(`Error fetching config by id: ${error.message}`);
    }
  }

  async update() {
    try {
      
    } catch (error) {
      throw new Error(`Error updating config: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'model_configurations';
    const careplanTableName = 'careplan';
    try {
      ;
    } catch (error) {
      console.error(`Error deleting row with ID ${id} from ${tableName} table:`, error);
    }
  }

  static async reindexTable() {
    const tableName = 'model_configurations'; 
    try {
      
    } catch (error) {
      console.error(`Error re-indexing ${tableName} table:`, error);
    }
  }

}

module.exports = AI_Config;