const Book = require('../models/Book');
const db = require('../config/db');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

class RecommendationCache {
    constructor() {
        this.recommendations = null;
        this.lastUpdate = null;
        this.lastBookUpdate = null;
        this.isGenerating = false;
        this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    }

    needsUpdate(lastBookChange) {
        // Return true if:
        // 1. We have no recommendations
        // 2. Cache has expired
        // 3. Books have been updated since last recommendation generation
        return (
            !this.recommendations ||
            !this.lastUpdate ||
            Date.now() - this.lastUpdate > this.CACHE_DURATION ||
            (lastBookChange && lastBookChange > this.lastBookUpdate)
        );
    }

    setRecommendations(recommendations, lastBookChange) {
        this.recommendations = recommendations;
        this.lastUpdate = Date.now();
        this.lastBookUpdate = lastBookChange;
        this.isGenerating = false;
    }

    getRecommendations() {
        return this.recommendations;
    }

    setGenerating(value) {
        this.isGenerating = value;
    }

    isCurrentlyGenerating() {
        return this.isGenerating;
    }
}



const enhanceRecommendationsWithMetadata = async (recommendations) => {
    if (!recommendations || !recommendations.recommendations) return recommendations;

    const enrichedRecommendations = await Promise.all(
        recommendations.recommendations.map(async (rec) => {
            try {
                const query = `${rec.title} ${rec.author}`.trim();
                const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_BOOKS_API_KEY}&maxResults=1`;

                const response = await axios.get(url);

                if (response.data.items && response.data.items[0]?.volumeInfo) {
                    const bookData = response.data.items[0].volumeInfo;
                    const imageLinks = bookData.imageLinks || {};

                    // Get the highest quality image available
                    let coverUrl = imageLinks.extraLarge ||
                        imageLinks.large ||
                        imageLinks.medium ||
                        imageLinks.small ||
                        imageLinks.thumbnail;

                    if (coverUrl) {
                        // Convert to HTTPS and remove zoom parameters
                        coverUrl = coverUrl
                            .replace('http://', 'https://')
                            .replace('zoom=1', 'zoom=3')
                            .replace('&edge=curl', '');
                    }

                    return {
                        ...rec,
                        cover: coverUrl || null,
                        description: bookData.description || "No description available",
                        published_date: bookData.publishedDate || "N/A",
                        isbn: bookData.industryIdentifiers ?
                            bookData.industryIdentifiers.find(id => id.type === "ISBN_13")?.identifier ||
                            bookData.industryIdentifiers.find(id => id.type === "ISBN_10")?.identifier :
                            "N/A",
                        page_count: bookData.pageCount || null,
                        genres: bookData.categories || [],
                        language: bookData.language || "N/A",
                        publisher: bookData.publisher || "N/A"
                    };
                }

                return rec;
            } catch (error) {
                console.error(`Error fetching metadata for ${rec.title}:`, error);
                return rec;
            }
        })
    );

    return {
        ...recommendations,
        recommendations: enrichedRecommendations
    };
};


const cache = new RecommendationCache();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

class RecommendationService {

    static cleanJsonResponse(text) {
        try {
            // Remove markdown code blocks and trim whitespace
            const cleaned = text
                .replace(/```json\n?/g, '')  // Remove ```json markers
                .replace(/```\n?/g, '')      // Remove remaining ``` markers
                .replace(/^\s*\{\n/, '{')    // Clean up starting bracket
                .replace(/\n\s*\}\s*$/, '}') // Clean up ending bracket
                .trim();

            console.log('Cleaned response:', cleaned);
            return cleaned;
        } catch (error) {
            console.error('Error cleaning JSON response:', error);
            throw error;
        }
    }

    static async getRecommendations() {
        try {
            const [lastUpdateResult] = await db.execute(`
        SELECT MAX(last_updated) as lastBookChange
        FROM book
        WHERE reading_status IN ('completed', 'reading', 'favorite')
      `);
            const lastBookChange = lastUpdateResult[0].lastBookChange;

            // Check cache first
            if (!cache.needsUpdate(lastBookChange)) {
                console.log('Returning cached recommendations');
                return cache.getRecommendations();
            }

            if (cache.isCurrentlyGenerating()) {
                console.log('Recommendations are currently being generated');
                return { message: "Generating recommendations..." };
            }

            cache.setGenerating(true);

            // Get ALL books from library for filtering
            const [allBooks] = await db.execute('SELECT title FROM book');
            const existingBooks = new Set(allBooks.map(book => book.title.toLowerCase().trim()));

            // Get reading history for recommendations
            const [rows] = await db.execute(`
        SELECT 
          title,
          author,
          genres,
          rating,
          reading_status,
          description
        FROM book
        WHERE reading_status IN ('completed', 'reading', 'favorite')
      `);

            if (rows.length === 0) {
                cache.setGenerating(false);
                return {
                    analysis: {
                        preferred_genres: [],
                        favorite_authors: [],
                        reading_patterns: "Not enough reading history"
                    },
                    recommendations: []
                };
            }

            // Format the books data
            const booksData = rows.map(book => {
                let parsedGenres = [];
                try {
                    if (book.genres) {
                        if (typeof book.genres === 'string') {
                            try {
                                parsedGenres = JSON.parse(book.genres);
                            } catch {
                                parsedGenres = book.genres.split(',').map(g => g.trim());
                            }
                        } else if (Array.isArray(book.genres)) {
                            parsedGenres = book.genres;
                        }
                    }
                } catch (error) {
                    console.error('Error parsing genres for book:', book.title, error);
                    parsedGenres = [];
                }

                return {
                    title: book.title,
                    author: book.author,
                    genres: parsedGenres,
                    rating: book.rating,
                    status: book.reading_status
                };
            });

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
                generationConfig: {
                    temperature: 0.7,
                    topK: 32,
                    topP: 0.8,
                    maxOutputTokens: 4096,
                }
            });

            const prompt = `
            As a book recommendation expert, analyze this user's reading history and preferences:

            ${JSON.stringify(booksData, null, 2)}

            They already have these books in their library (DO NOT recommend any of these):
            ${Array.from(existingBooks).join(', ')}

            Return ONLY a raw JSON object with NO markdown formatting, code blocks, or additional text.
            Format:
            {
                "analysis": {
                "preferred_genres": ["genre1", "genre2"],
                "favorite_authors": ["author1", "author2"],
                "reading_patterns": "description of patterns"
                },
                "recommendations": [
                {
                    "title": "Book Title",
                    "author": "Author Name",
                    "reason": "Reason for recommendation",
                    "similar_to": "Similar book from their history"
                }
                ]
            }

            Requirements:
            - Return ONLY the raw JSON above with NO additional formatting or text
            - Do NOT include markdown code blocks, \`\`\`json, or \`\`\`
            - Generate exactly 4 unique recommendations
            - DO NOT include any books from their library
            - Each recommendation must be unique
            - Keep reasons concise but informative
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            try {
                const recommendations = JSON.parse(responseText.trim());

                // Double-check no existing books made it through
                if (recommendations.recommendations) {
                    recommendations.recommendations = recommendations.recommendations
                        .filter(rec => !existingBooks.has(rec.title.toLowerCase().trim()));

                    console.log('Adding metadata and covers to recommendations...');
                    const enhancedRecommendations = await enhanceRecommendationsWithMetadata(recommendations);
                    cache.setRecommendations(enhancedRecommendations, lastBookChange);
                    return enhancedRecommendations;
                }

                throw new Error('Invalid recommendations structure');
            } catch (parseError) {
                console.error('Error parsing Gemini response:', parseError);
                cache.setGenerating(false);
                return {
                    analysis: {
                        preferred_genres: [],
                        favorite_authors: [],
                        reading_patterns: "Error generating analysis"
                    },
                    recommendations: []
                };
            }

        } catch (error) {
            console.error('Error generating recommendations:', error);
            cache.setGenerating(false);
            return {
                analysis: {
                    preferred_genres: [],
                    favorite_authors: [],
                    reading_patterns: "Unable to analyze reading patterns"
                },
                recommendations: []
            };
        }
    }
}

module.exports = RecommendationService;