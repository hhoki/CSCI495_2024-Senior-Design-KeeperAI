const db = require("../config/db");
const path = require('path');

//Google Gemini Configurations and Libraries
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
//Replace in .env with your api key
const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

class Book {
  constructor(book_id, shelf_id, title, author, published_date, isbn, rating, description, user_notes, cover, shelf_location) {
    this.book_id = book_id === undefined ? null : book_id;
    this.shelf_id = shelf_id === undefined ? null : shelf_id;
    this.title = title || '';
    this.author = author || 'Unknown';
    this.published_date = published_date === undefined ? null : published_date;
    this.isbn = isbn === undefined ? null : isbn;
    this.rating = rating === undefined ? null : rating;
    this.description = description === undefined ? null : description;
    this.user_notes = user_notes || '';
    this.cover = cover === undefined ? null : cover;
    this.shelf_location = shelf_location === undefined ? null : shelf_location;
  }

  static ReadingStatus = {
    UNSET: 'unset',
    COMPLETED: 'completed',
    PAUSED: 'paused',
    READING: 'reading',
    FAVORITE: 'favorite',
    DROPPED: 'dropped'
  };

  async save() {
    try {
      // Log the sanitized data before saving
      console.log('Attempting to save book with data:', {
        shelf_id: this.shelf_id,
        title: this.title,
        author: this.author,
        published_date: this.published_date,
        isbn: this.isbn,
        rating: this.rating,
        description: this.description,
        user_notes: this.user_notes,
        cover: this.cover,
        shelf_location: this.shelf_location
      });

      const sql = `
        INSERT INTO book (
          shelf_id, title, author, published_date, isbn, rating, 
          description, user_notes, cover, shelf_location
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        this.shelf_id,
        this.title,
        this.author,
        this.published_date,
        this.isbn,
        this.rating,
        this.description,
        this.user_notes,
        this.cover,
        this.shelf_location
      ];

      // Verify no undefined values
      const hasUndefined = values.some(value => value === undefined);
      if (hasUndefined) {
        console.error('Found undefined values in:', values);
        throw new Error('Cannot save book with undefined values');
      }

      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      console.error('Error in Book.save():', error);
      throw new Error(`Error saving book: ${error.message}`);
    }
  }

  // Method to get books by reading status
  static async findByReadingStatus(status) {
    try {
      const sql = `
        SELECT * FROM book 
        WHERE reading_status = ?
      `;
      
      const [rows] = await db.execute(sql, [status]);
      return rows;
    } catch (error) {
      console.error('Error fetching books by reading status:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const sql = "SELECT * FROM book";
      const [rows] = await db.execute(sql);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching all book: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = "SELECT * FROM book WHERE book_id = ?";
      const [rows] = await db.execute(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching book by id: ${error.message}`);
    }
  }

  static async findByShelfId(shelfId) {
    try {
      const sql = "SELECT * FROM book WHERE shelf_id = ?";
      const [rows] = await db.execute(sql, [shelfId]);
      return rows;
    } catch (error) {
      console.error('Error fetching books by shelf ID:', error);
      throw new Error(`Error fetching books by shelf ID: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      console.log('Updating book with data:', updateData);
      
      const updates = [];
      const values = [];
      
      if (updateData.rating !== undefined) {
        updates.push('rating = ?');
        values.push(updateData.rating);
      }
      
      if (updateData.user_notes !== undefined) {
        updates.push('user_notes = ?');
        values.push(updateData.user_notes);
      }

      if (updateData.reading_status !== undefined) {
        updates.push('reading_status = ?');
        values.push(updateData.reading_status);
      }
      
      if (updates.length === 0) {
        throw new Error('No valid update fields provided');
      }

      values.push(this.book_id); // Add book_id for WHERE clause
      
      const sql = `
        UPDATE book 
        SET ${updates.join(', ')}
        WHERE book_id = ?
      `;
      
      console.log('Executing SQL:', sql, 'with values:', values);
      const [result] = await db.execute(sql, values);
      
      if (result.affectedRows === 0) {
        throw new Error(`No book found with ID ${this.book_id}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  static async updateNotes(bookId, notes) {
    try {
      console.log('Updating notes for book:', bookId, 'with:', notes);
      const sql = `
        UPDATE book 
        SET user_notes = ?
        WHERE book_id = ?
      `;
      const values = [notes, bookId];
      
      console.log('Executing SQL:', sql, 'with values:', values);
      const [result] = await db.execute(sql, values);
      console.log('Update result:', result);
      
      if (result.affectedRows === 0) {
        throw new Error(`No book found with ID ${bookId}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating book notes:', error);
      throw new Error(`Error updating book notes: ${error.message}`);
    }
  }

  static async deleteById(id) {
    try {
      const deleteBookQuery = `
        DELETE FROM book 
        WHERE book_id = ?
      `;
      const [result] = await db.execute(deleteBookQuery, [id]);
  
      console.log(`Deleted book with ID ${id}`);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting book with ID ${id}:`, error);
      throw error;
    }
  }
  static async deleteByShelfId(shelfId) {
    try {
      console.log(`Deleting books for shelf ID: ${shelfId}`);
      const sql = "DELETE FROM book WHERE shelf_id = ?";
      const [result] = await db.execute(sql, [shelfId]);
      console.log(`Deleted ${result.affectedRows} books for shelf ID ${shelfId}`);
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting books by shelf ID:', error);
      throw new Error(`Error deleting books by shelf ID: ${error.message}`);
    }
  }

  static async reindexTable() {
    const tableName = 'book';
    try {
      //Get all rows from the table sorted by ID
      const query = `SELECT * FROM ${tableName} ORDER BY id`;
      const [rows] = await db.execute(query);

      //Update IDs sequentially starting from 1
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


  static async uploadToGemini(imagePath, mimeType, displayName) {
    try {
      const uploadResult = await fileManager.uploadFile(imagePath, {
        mimeType,
        displayName,
      });
      console.log(`Uploaded file ${displayName} as: ${uploadResult.file.uri}`);
      return uploadResult;
    } catch (error) {
      console.error("Error uploading file to Google Gemini:", error);
      throw error;
    }
  }

  static async generateContentFromImage(fileUri, mimeType) {
    try {
      const schema = {
        description: "List of detected book titles",
        type: "array",
        items: {
          type: "object",
          properties: {
            bookTitle: {
              type: "string",
              description: "Title of the book detected in the image",
              nullable: false,
            },
          },
          required: ["bookTitle"],
        },
      };

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const result = await model.generateContent([
        "Analyze this image and tell me the titles of the books you see. List only the titles, not the authors. The titles should follow standard title capitalization rules.",
        {
          fileData: {
            fileUri,
            mimeType,
          },
        },
      ]);

      console.log("Generated Content from Google Gemini:", result.response.text());
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error("Error generating content from image:", error);
      throw error;
    }
  }

  static async fetchOpenLibraryMetadata(bookTitles) {
    try {
      const bookMetadata = await Promise.all(
        bookTitles.map(async (bookTitle) => {
          try {
            const queryTitle = encodeURIComponent(bookTitle);
            const response = await axios.get(`https://openlibrary.org/search.json?title=${queryTitle}&fields=title,author_name,first_publish_year,isbn,cover_i,description,subtitle&limit=1`);

            if (response.data.docs && response.data.docs.length > 0) {
              const book = response.data.docs[0];
              return {
                title: bookTitle,
                author: book.author_name ? book.author_name[0] : "Unknown",
                published_date: book.first_publish_year || "N/A",
                isbn: book.isbn ? book.isbn[0] : "N/A",
                cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
                description: book.subtitle || "No description available",
                rating: null,
                user_notes: "",
                shelf_id: null,
                shelf_location: null
              };
            } else {
              return {
                title: bookTitle,
                author: "Unknown",
                published_date: "N/A",
                isbn: "N/A",
                cover: null,
                description: "No description available",
                rating: null,
                user_notes: "",
                shelf_id: null,
                shelf_location: null,
                message: "No metadata found in OpenLibrary"
              };
            }
          } catch (error) {
            console.error(`Error fetching metadata for "${bookTitle}":`, error);
            return {
              title: bookTitle,
              message: "Error fetching metadata",
              error: error.message
            };
          }
        })
      );

      return bookMetadata;
    } catch (error) {
      console.error("Error in fetchOpenLibraryMetadata:", error);
      throw error;
    }
  }

  static async searchBooks(query) {
    try {
      const sql = `
        SELECT b.*, s.shelf_name 
        FROM book b
        LEFT JOIN shelf s ON b.shelf_id = s.shelf_id
        WHERE b.title LIKE ? OR b.author LIKE ?
      `;
      const searchPattern = `%${query}%`;
      const [rows] = await db.execute(sql, [searchPattern, searchPattern]);
      return rows;
    } catch (error) {
      console.error('Error in Book.searchBooks:', error);
      throw error;
    }
  }
}



module.exports = Book;
