/**
 * =============================================================================
 * server.js
 * ---------
 * Lab 03: REST API, Query Parameters, Validation, and Debugging
 * Student Name  : Sree Charani (Grandhe Sree Charani)
 * Reg. Number   : 252U1R3059
 * Class/Section : CSE-DS-2B
 * Subject       : Backend Development Fundamentals
 *
 * Description:
 * Production-ready RESTful Express API connected to SQLite (books.db).
 * Extends Lab 2 with advanced REST query capabilities:
 *   - Search via SQL LIKE (? wildcard)
 *   - Price-range filtering (min_price, max_price)
 *   - Safe sorting via column & direction whitelisting (order_by, order)
 *   - Pagination with parameterized limit and offset
 *   - Strict input validation with standardized {"message": "..."} errors
 *   - Correct HTTP status codes (200, 201, 400, 404, 500)
 * =============================================================================
 */

// 1. Import necessary Node.js and npm modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// 2. Initialize the Express application
const app = express();

// Middleware: Parse incoming JSON request bodies
app.use(express.json());

// Port configuration: use environment port (Render/Railway/cloud) or default to 3000
const PORT = process.env.PORT || 3000;

// Path to SQLite database file inside lab-03 directory
const dbPath = path.join(__dirname, 'books.db');

// Global database reference variable and initialization promise
let db = null;
let dbInitPromise = null;

// Middleware: Ensure database is fully initialized before processing any request
app.use(async (req, res, next) => {
  try {
    if (!db) {
      if (!dbInitPromise) {
        dbInitPromise = initializeDBAndServer();
      }
      await dbInitPromise;
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database initialization failed.' });
  }
});

// =============================================================================
// VALIDATION HELPER FUNCTIONS
// =============================================================================

/**
 * Validates request body fields for creating or updating a book.
 * Required fields: title, author, price.
 * Returns an error message string if invalid, or null if valid.
 */
function validateBookPayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a valid JSON object';
  }

  const { title, author, price, pages } = body;

  // 1. Title validation: required, non-empty string
  if (title === undefined || title === null || (typeof title === 'string' && title.trim() === '')) {
    return 'Title is required';
  }
  if (typeof title !== 'string') {
    return 'Title must be a string';
  }

  // 2. Author validation: required, non-empty string
  if (author === undefined || author === null || (typeof author === 'string' && author.trim() === '')) {
    return 'Author is required';
  }
  if (typeof author !== 'string') {
    return 'Author must be a string';
  }

  // 3. Price validation: required, numeric, positive (> 0)
  if (price === undefined || price === null || price === '') {
    return 'Price is required';
  }
  if (typeof price !== 'number' || isNaN(price)) {
    return 'Price must be a number';
  }
  if (price <= 0) {
    return 'Price must be a positive number';
  }

  // 4. Pages validation: optional, but if provided must be a positive integer
  if (pages !== undefined && pages !== null) {
    if (typeof pages !== 'number' || !Number.isInteger(pages) || pages <= 0) {
      return 'Pages must be a positive integer';
    }
  }

  return null;
}

/**
 * Validates the bookId route parameter.
 * Returns the parsed integer if valid, or null if invalid.
 */
function parseAndValidateBookId(paramId) {
  const id = Number(paramId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// Whitelists for query parameters to prevent SQL injection in ORDER BY clauses
const ALLOWED_ORDER_BY_COLUMNS = ['id', 'title', 'author', 'price', 'pages'];
const ALLOWED_ORDER_DIRECTIONS = ['ASC', 'DESC'];

// =============================================================================
// REST API ENDPOINTS
// =============================================================================

/**
 * Root Route: GET /
 * Informational endpoint presenting API overview, author details, and route catalogue.
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Books REST API (Lab 03)',
    student: 'Sree Charani (252U1R3059)',
    classSection: 'CSE-DS-2B',
    subject: 'Backend Development Fundamentals',
    supportedQueryParameters: {
      search_q: 'Partial match on title (e.g. ?search_q=JavaScript)',
      order_by: 'Sort column: id, title, author, price, pages (default: id)',
      order: 'Sort direction: ASC, DESC (default: ASC)',
      limit: 'Page size positive integer (default: 10)',
      offset: 'Page offset non-negative integer (default: 0)',
      min_price: 'Filter by minimum price (e.g. ?min_price=400)',
      max_price: 'Filter by maximum price (e.g. ?max_price=800)'
    },
    endpoints: {
      getAllBooks: 'GET /books',
      getBookById: 'GET /books/:bookId',
      addBook: 'POST /books',
      updateBook: 'PUT /books/:bookId',
      deleteBook: 'DELETE /books/:bookId'
    }
  });
});

/**
 * Endpoint 1: GET /books
 * Purpose: Retrieve all books with optional search, price filtering, sorting, and pagination.
 *
 * Query Parameters:
 *   - search_q : partial match on title using SQL LIKE ?
 *   - order_by : sort column (id, title, author, price, pages; default: id)
 *   - order    : sort direction (ASC, DESC; default: ASC)
 *   - limit    : maximum records to return (default: 10)
 *   - offset   : number of records to skip (default: 0)
 *   - min_price: filter books with price >= min_price
 *   - max_price: filter books with price <= max_price
 *
 * Status Codes:
 *   - 200 OK: on successful query
 *   - 400 Bad Request: on invalid query parameters
 *   - 500 Internal Server Error: on database failure
 */
app.get(['/books', '/books/'], async (req, res) => {
  try {
    const {
      search_q,
      order_by = 'id',
      order = 'ASC',
      limit = '10',
      offset = '0',
      min_price,
      max_price
    } = req.query;

    // --- Query Parameter Validation ---

    // 1. Validate order_by against whitelist
    const safeOrderBy = String(order_by).toLowerCase();
    if (!ALLOWED_ORDER_BY_COLUMNS.includes(safeOrderBy)) {
      return res.status(400).json({
        message: `Invalid 'order_by' parameter. Allowed values: ${ALLOWED_ORDER_BY_COLUMNS.join(', ')}`
      });
    }

    // 2. Validate order direction against whitelist
    const safeOrder = String(order).toUpperCase();
    if (!ALLOWED_ORDER_DIRECTIONS.includes(safeOrder)) {
      return res.status(400).json({
        message: "Invalid 'order' parameter. Allowed values: ASC, DESC"
      });
    }

    // 3. Validate limit (must be a positive integer)
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        message: "Invalid 'limit' parameter. It must be a positive integer"
      });
    }

    // 4. Validate offset (must be a non-negative integer)
    const parsedOffset = Number(offset);
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        message: "Invalid 'offset' parameter. It must be a non-negative integer"
      });
    }

    // 5. Validate min_price if provided
    let parsedMinPrice = null;
    if (min_price !== undefined) {
      parsedMinPrice = Number(min_price);
      if (isNaN(parsedMinPrice) || parsedMinPrice < 0) {
        return res.status(400).json({
          message: "Invalid 'min_price' parameter. It must be a non-negative number"
        });
      }
    }

    // 6. Validate max_price if provided
    let parsedMaxPrice = null;
    if (max_price !== undefined) {
      parsedMaxPrice = Number(max_price);
      if (isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
        return res.status(400).json({
          message: "Invalid 'max_price' parameter. It must be a non-negative number"
        });
      }
    }

    // 7. Cross-validate min_price and max_price
    if (parsedMinPrice !== null && parsedMaxPrice !== null && parsedMinPrice > parsedMaxPrice) {
      return res.status(400).json({
        message: "'min_price' cannot be greater than 'max_price'"
      });
    }

    // --- Dynamic Parameterized SQL Construction ---
    let sqlQuery = 'SELECT * FROM book WHERE 1=1';
    const queryParams = [];

    // Search by partial title using LIKE ?
    if (search_q !== undefined && search_q.trim() !== '') {
      sqlQuery += ' AND title LIKE ?';
      queryParams.push(`%${search_q.trim()}%`);
    }

    // Minimum price filter
    if (parsedMinPrice !== null) {
      sqlQuery += ' AND price >= ?';
      queryParams.push(parsedMinPrice);
    }

    // Maximum price filter
    if (parsedMaxPrice !== null) {
      sqlQuery += ' AND price <= ?';
      queryParams.push(parsedMaxPrice);
    }

    // Safe sorting using whitelisted column and direction (cannot be injected)
    sqlQuery += ` ORDER BY ${safeOrderBy} ${safeOrder}`;

    // Pagination using parameterized limit and offset
    sqlQuery += ' LIMIT ? OFFSET ?;';
    queryParams.push(parsedLimit, parsedOffset);

    // Execute query using sqlite db.all()
    const books = await db.all(sqlQuery, queryParams);
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to fetch books.' });
  }
});

/**
 * Endpoint 2: GET /books/:bookId
 * Purpose: Retrieve a single book by its primary key ID.
 * Status Codes:
 *   - 200 OK: book found
 *   - 400 Bad Request: non-integer / invalid book ID
 *   - 404 Not Found: book does not exist
 *   - 500 Internal Server Error: database error
 */
app.get(['/books/:bookId', '/books/:bookId/'], async (req, res) => {
  try {
    const bookId = parseAndValidateBookId(req.params.bookId);
    if (bookId === null) {
      return res.status(400).json({ message: 'Invalid book ID. It must be a positive integer' });
    }

    // Parameterized SELECT query
    const getBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book by ID:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to fetch book.' });
  }
});

/**
 * Endpoint 3: POST /books
 * Purpose: Create a new book record in the SQLite database.
 * Status Codes:
 *   - 201 Created: book inserted successfully
 *   - 400 Bad Request: missing/invalid required fields
 *   - 500 Internal Server Error: database error
 */
app.post(['/books', '/books/'], async (req, res) => {
  try {
    const validationError = validateBookPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, author, price, pages = 100 } = req.body;

    // Parameterized INSERT statement preventing SQL injection
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(addBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages !== undefined && pages !== null ? pages : 100
    ]);

    res.status(201).json({
      message: 'Book created successfully',
      bookId: result.lastID
    });
  } catch (error) {
    console.error('Error adding book:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to create book.' });
  }
});

/**
 * Endpoint 4: PUT /books/:bookId
 * Purpose: Update an existing book's details.
 * Status Codes:
 *   - 200 OK: book updated successfully
 *   - 400 Bad Request: invalid bookId or invalid body
 *   - 404 Not Found: bookId does not exist
 *   - 500 Internal Server Error: database error
 */
app.put(['/books/:bookId', '/books/:bookId/'], async (req, res) => {
  try {
    const bookId = parseAndValidateBookId(req.params.bookId);
    if (bookId === null) {
      return res.status(400).json({ message: 'Invalid book ID. It must be a positive integer' });
    }

    const validationError = validateBookPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Check if the book exists prior to running update
    const checkBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const { title, author, price, pages = 100 } = req.body;

    // Parameterized UPDATE query
    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    await db.run(updateBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages !== undefined && pages !== null ? pages : existingBook.pages,
      bookId
    ]);

    res.status(200).json({
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to update book.' });
  }
});

/**
 * Endpoint 5: DELETE /books/:bookId
 * Purpose: Delete an existing book by ID.
 * Status Codes:
 *   - 200 OK: book deleted successfully
 *   - 400 Bad Request: invalid bookId parameter
 *   - 404 Not Found: bookId does not exist
 *   - 500 Internal Server Error: database error
 */
app.delete(['/books/:bookId', '/books/:bookId/'], async (req, res) => {
  try {
    const bookId = parseAndValidateBookId(req.params.bookId);
    if (bookId === null) {
      return res.status(400).json({ message: 'Invalid book ID. It must be a positive integer' });
    }

    // Check if the book exists before attempting deletion
    const checkBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Parameterized DELETE statement
    const deleteBookQuery = 'DELETE FROM book WHERE id = ?;';
    await db.run(deleteBookQuery, [bookId]);

    res.status(200).json({
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to delete book.' });
  }
});

// Fallback 404 handler for unrecognized paths
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found. Valid routes: GET /books, GET /books/:bookId, POST /books, PUT /books/:bookId, DELETE /books/:bookId'
  });
});

// =============================================================================
// DATABASE INITIALIZATION & SERVER STARTUP
// =============================================================================

/**
 * initializeDBAndServer()
 * Asynchronous function that:
 *   1. Opens connection to SQLite database (books.db).
 *   2. Handles serverless environments (copies to /tmp if process.env.VERCEL is set).
 *   3. Creates the 'book' table if it does not already exist.
 *   4. Seeds 10 initial records if table is empty (prevents duplicates on restart).
 *   5. Starts Express server on specified PORT (only if not serverless).
 *   6. Handles database connection errors with try/catch.
 */
const initializeDBAndServer = async () => {
  try {
    // In serverless environments (Vercel), copy books.db to /tmp for full write permissions
    let resolvedDbPath = dbPath;
    if (process.env.VERCEL) {
      const tmpPath = path.join('/tmp', 'books.db');
      try {
        if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, tmpPath);
        }
        resolvedDbPath = tmpPath;
      } catch (e) {
        console.error('Error copying books.db to /tmp:', e.message);
      }
    }

    // 1. Open SQLite database connection
    db = await open({
      filename: resolvedDbPath,
      driver: sqlite3.Database
    });

    console.log(`[Database] SQLite connected successfully: ${resolvedDbPath}`);

    // 2. Create the table if it does not exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    // 3. Prevent duplicate sample inserts on restarts
    const rowCountResult = await db.get('SELECT COUNT(*) AS count FROM book;');
    if (rowCountResult.count === 0) {
      console.log('[Database] Table is empty. Seeding 10 sample books...');

      const sampleBooks = [
        ['The Pragmatic Programmer', 'David Thomas & Andrew Hunt', 599, 352],
        ['Clean Code', 'Robert C. Martin', 650, 464],
        ['JavaScript: The Good Parts', 'Douglas Crockford', 399, 176],
        ["You Don't Know JS: Scope & Closures", 'Kyle Simpson', 320, 98],
        ['Designing Data-Intensive Applications', 'Martin Kleppmann', 850, 616],
        ['Node.js Design Patterns', 'Mario Casciaro', 750, 660],
        ['Introduction to Algorithms', 'Thomas H. Cormen', 999, 1312],
        ['Database System Concepts', 'Abraham Silberschatz', 899, 1376],
        ['Eloquent JavaScript', 'Marijn Haverbeke', 480, 472],
        ['Refactoring', 'Martin Fowler', 720, 448]
      ];

      for (const [title, author, price, pages] of sampleBooks) {
        await db.run(
          'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
          [title, author, price, pages]
        );
      }

      console.log('[Database] Successfully seeded 10 sample books.');
    } else {
      console.log(`[Database] Database already contains ${rowCountResult.count} book(s). Skipping seeding.`);
    }

    // 4. Start listening on the specified port (if not running in serverless environment)
    let server = null;
    if (!process.env.VERCEL) {
      server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Server] Express server running on port ${PORT}`);
        console.log(`[Server] Available endpoints:`);
        console.log(`         GET    http://localhost:${PORT}/books`);
        console.log(`         GET    http://localhost:${PORT}/books/:bookId`);
        console.log(`         POST   http://localhost:${PORT}/books`);
        console.log(`         PUT    http://localhost:${PORT}/books/:bookId`);
        console.log(`         DELETE http://localhost:${PORT}/books/:bookId`);
        console.log(`[Server] Press Ctrl+C to stop.`);
      });
    }

    return { app, db, server };
  } catch (error) {
    console.error(`[Error] Database initialization failed: ${error.message}`);
    process.exit(1);
  }
};

// Start database and server
dbInitPromise = initializeDBAndServer();

// Export for testing and serverless handlers (e.g., Vercel)
app.app = app;
app.initializeDBAndServer = initializeDBAndServer;
module.exports = app;
