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
      const sql = "SELECT * FROM model_configurations WHERE id = ?";
      const [rows] = await db.execute(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching config by id: ${error.message}`);
    }
  }

  async update() {
    try {
      const sql = `
        UPDATE model_configurations
        SET config_id = ?,
            model_used = ?,
            version = ?,
            config_params = ?
        WHERE id = ?
      `;
      const values = [this.config_id, this.model_used, this.version, this.config_params];
      
      await db.execute(sql, values);
    } catch (error) {
      throw new Error(`Error updating config: ${error.message}`);
    }
  }

  static async deleteById(id) {
    const tableName = 'model_configurations';
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
    const tableName = 'model_configurations'; 
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

module.exports = AI_Config;
