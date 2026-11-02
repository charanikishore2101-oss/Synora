/**
 * =============================================================================
 * server.js
 * ---------
 * Lab 02: SQLite Database and CRUD Routes
 * Student Name  : Grandhe Sree Charani
 * Reg. Number   : 252U1R3059
 * Section       : CSE-DS-2B
 *
 * Description:
 * Express server connected to a persistent SQLite database (books.db).
 * Implements complete RESTful CRUD operations (GET, POST, PUT, DELETE)
 * with robust input validation and parameterized queries to prevent SQL injection.
 * =============================================================================
 */

// 1. Import necessary modules
const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// 2. Initialize Express application
const app = express();

// Middleware to parse incoming JSON payloads in request bodies
app.use(express.json());

// Port configuration: use platform port (e.g., Render/Railway) or default to 3000
const PORT = process.env.PORT || 3000;

// Path to SQLite database file inside lab-02 folder
const dbPath = path.join(__dirname, 'books.db');

// Global database variable to hold the active SQLite connection
let db = null;

/**
 * Helper Validation Function
 * Validates request body fields for creating or updating a book.
 * Returns an error message string if invalid, or null if valid.
 */
function validateBookPayload(body) {
  const { title, author, price, pages } = body;

  if (title === undefined || author === undefined || price === undefined || pages === undefined) {
    return 'Missing required fields. Please provide title, author, price, and pages.';
  }

  if (typeof title !== 'string' || title.trim() === '') {
    return "Invalid 'title': must be a non-empty string.";
  }

  if (typeof author !== 'string' || author.trim() === '') {
    return "Invalid 'author': must be a non-empty string.";
  }

  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    return "Invalid 'price': must be a positive number.";
  }

  if (typeof pages !== 'number' || !Number.isInteger(pages) || pages <= 0) {
    return "Invalid 'pages': must be a positive integer.";
  }

  return null;
}

/**
 * Helper Validation Function
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

// =============================================================================
// CRUD API ENDPOINTS
// =============================================================================

/**
 * Root Route: GET /
 * Informational endpoint welcoming users and providing API overview.
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Books SQLite CRUD API (Lab 02)',
    student: 'Grandhe Sree Charani (252U1R3059)',
    endpoints: {
      getAllBooks: 'GET /books/',
      getBookById: 'GET /books/:bookId/',
      addBook: 'POST /books/',
      updateBook: 'PUT /books/:bookId/',
      deleteBook: 'DELETE /books/:bookId/'
    }
  });
});

/**
 * Endpoint 1: GET /books/
 * Purpose: Retrieve all book records from the database.
 * HTTP Status: 200 OK
 */
app.get('/books/', async (req, res) => {
  try {
    const getBooksQuery = 'SELECT * FROM book ORDER BY id ASC;';
    const booksArray = await db.all(getBooksQuery);
    res.status(200).json(booksArray);
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ error: 'Internal Server Error: Unable to fetch books.' });
  }
});

/**
 * Endpoint 2: GET /books/:bookId/
 * Purpose: Retrieve a single book using its primary key ID.
 * HTTP Status: 200 OK (found), 400 Bad Request (invalid ID), 404 Not Found (absent)
 */
app.get('/books/:bookId/', async (req, res) => {
  try {
    const bookId = parseAndValidateBookId(req.params.bookId);
    if (bookId === null) {
      return res.status(400).json({ error: 'Invalid book ID. It must be a positive integer.' });
    }

    // Parameterized SQL query using '?' placeholder to prevent SQL injection
    const getBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({ error: `Book with ID ${bookId} not found.` });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book by ID:', error.message);
    res.status(500).json({ error: 'Internal Server Error: Unable to fetch book.' });
  }
});

/**
 * Endpoint 3: POST /books/
 * Purpose: Add a new book to the database.
 * HTTP Status: 201 Created (success), 400 Bad Request (invalid input)
 */
app.post('/books/', async (req, res) => {
  try {
    const validationError = validateBookPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { title, author, price, pages } = req.body;

    // Parameterized INSERT query using '?' placeholders
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(addBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages
    ]);

    res.status(201).json({
      message: 'Book created successfully',
      bookId: result.lastID
    });
  } catch (error) {
    console.error('Error adding book:', error.message);
    res.status(500).json({ error: 'Internal Server Error: Unable to add book.' });
  }
});

/**
 * Endpoint 4: PUT /books/:bookId/
 * Purpose: Update an existing book's details.
 * HTTP Status: 200 OK (updated), 400 Bad Request (invalid ID or body), 404 Not Found (absent)
 */
app.put('/books/:bookId/', async (req, res) => {
  try {
    const bookId = parseAndValidateBookId(req.params.bookId);
    if (bookId === null) {
      return res.status(400).json({ error: 'Invalid book ID. It must be a positive integer.' });
    }

    const validationError = validateBookPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check whether the book exists before updating
    const checkBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ error: `Book with ID ${bookId} not found.` });
    }

    const { title, author, price, pages } = req.body;

    // Parameterized UPDATE query using '?' placeholders
    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    await db.run(updateBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages,
      bookId
    ]);

    res.status(200).json({
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(500).json({ error: 'Internal Server Error: Unable to update book.' });
  }
});

/**
 * Endpoint 5: DELETE /books/:bookId/
 * Purpose: Delete an existing book by ID.
 * HTTP Status: 200 OK (deleted), 400 Bad Request (invalid ID), 404 Not Found (absent)
 */
app.delete('/books/:bookId/', async (req, res) => {
  try {
    const bookId = parseAndValidateBookId(req.params.bookId);
    if (bookId === null) {
      return res.status(400).json({ error: 'Invalid book ID. It must be a positive integer.' });
    }

    // Check whether the book exists before attempting deletion
    const checkBookQuery = 'SELECT * FROM book WHERE id = ?;';
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ error: `Book with ID ${bookId} not found.` });
    }

    // Parameterized DELETE query using '?' placeholder
    const deleteBookQuery = 'DELETE FROM book WHERE id = ?;';
    await db.run(deleteBookQuery, [bookId]);

    res.status(200).json({
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ error: 'Internal Server Error: Unable to delete book.' });
  }
});

// 404 Fallback Middleware for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found. Valid routes: GET /books/, GET /books/:bookId/, POST /books/, PUT /books/:bookId/, DELETE /books/:bookId/'
  });
});

// =============================================================================
// DATABASE CONNECTION AND SERVER INITIALIZATION
// =============================================================================

/**
 * initializeDBAndServer()
 * 1. Opens connection to SQLite database (books.db).
 * 2. Creates the 'book' table if it does not already exist.
 * 3. Seeds 10 initial records if the table is empty (prevents duplicate entries on server restart).
 * 4. Starts the Express server only AFTER database connection is fully established.
 * 5. Uses async/await with robust try/catch error handling.
 */
const initializeDBAndServer = async () => {
  try {
    // 1. Open SQLite database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`[Database] SQLite connected successfully: ${dbPath}`);

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

    // 3. Check existing record count to prevent duplicate sample inserts on restarts
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

    // 4. Start listening on the specified port (explicitly bind to 0.0.0.0 for Render / cloud containers)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Express server running on port ${PORT}`);
      console.log(`[Server] Press Ctrl+C to stop.`);
    });

    return { app, db, server };
  } catch (error) {
    console.error(`[Error] Database initialization failed: ${error.message}`);
    process.exit(1);
  }
};

// Start the database and server
initializeDBAndServer();

// Export for testing purposes
module.exports = { app, initializeDBAndServer };
