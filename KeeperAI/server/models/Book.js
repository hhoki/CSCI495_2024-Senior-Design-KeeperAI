const db = require("../config/db");
const path = require('path');
const fs = require('fs');

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
  constructor(
    book_id,
    shelf_id,
    title,
    author,
    published_date,
    isbn,
    rating,
    description,
    user_notes,
    cover,
    shelf_location,
    genres,
    publisher,
    page_count
  ) {
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
    this.genres = Array.isArray(genres) ? genres : [];
    this.publisher = publisher || null;
    this.page_count = page_count === undefined ? null : page_count;
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
      console.log('Save method - Current genres:', this.genres);

      const sql = `
        INSERT INTO book (
          shelf_id, title, author, published_date, isbn, rating, 
          description, user_notes, cover, shelf_location, genres
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const genresJson = JSON.stringify(this.genres || []);
      
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
        this.shelf_location,
        genresJson
      ];

      console.log('Save method - SQL values:', values);

      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      console.error('Error in Book.save():', error);
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

      // Generate SQL based on provided fields
      const updates = [];
      const values = [];

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (updates.length === 0) {
        throw new Error('No valid update fields provided');
      }

      // Add book_id for WHERE clause
      values.push(this.book_id);

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

  static async generateContentFromImage(fileUri, mimeType, originalFilePath) {
    try {
      console.log('Reading file for content generation:', originalFilePath);

      const imageData = fs.readFileSync(originalFilePath);
      const base64Image = imageData.toString('base64');

      console.log('Image data loaded, initializing model');

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      });

      console.log('Model initialized, preparing prompt');

      const parts = [
        {
          text: "Analyze this image and list the book titles you can see. Return only a JSON array where each object has a 'bookTitle' property. Do not include any markdown formatting or code block markers."
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        }
      ];

      console.log('Sending request to model');
      const result = await model.generateContent(parts);
      const responseText = result.response.text();
      console.log('Received response:', responseText);

      // Clean the response text by removing markdown code block markers
      const cleanedText = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const bookTitles = JSON.parse(cleanedText);
        console.log('Parsed book titles:', bookTitles);
        return Array.isArray(bookTitles) ? bookTitles : [{ bookTitle: cleanedText }];
      } catch (error) {
        console.log('JSON parsing failed, extracting titles manually:', error);

        // Extract title objects from the response
        const titleMatches = cleanedText.match(/"bookTitle":\s*"([^"]+)"/g);
        if (titleMatches) {
          return titleMatches.map(match => {
            const title = match.match(/"bookTitle":\s*"([^"]+)"/)[1];
            return { bookTitle: title };
          });
        }

        // If no title objects found, fall back to line-by-line processing
        return cleanedText
          .split('\n')
          .filter(line => line.trim())
          .filter(line => !line.match(/^[\[\]{},]$/)) // Remove lines that are just brackets or commas
          .map(line => ({ bookTitle: line.trim() }));
      }

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
