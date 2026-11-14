/**
 * =============================================================================
 * server.js
 * ---------
 * Lab 04: Registration, Login and JWT Authentication
 * Student Name  : Sree Charani (Grandhe Sree Charani)
 * Reg. Number   : 252U1R3059
 * Class/Section : CSE-DS-IIB
 * Study Level   : UG (Year II, Term II)
 * Subject       : Backend Development Fundamentals
 *
 * Description:
 * Production-ready RESTful Express API connected to SQLite (books.db).
 * Extends Lab 3 by introducing secure user authentication:
 *   - User Registration (POST /register/) with input validation
 *   - Duplicate username prevention (HTTP 400 Bad Request)
 *   - Secure password hashing via bcrypt (salt rounds: 10)
 *   - User Login (POST /login/) with credential verification
 *   - JSON Web Token (JWT) generation containing username in payload
 *   - Preserves all Lab 3 book catalog REST endpoints
 * =============================================================================
 */

// 1. Import necessary Node.js and npm modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 2. Initialize the Express application
const app = express();

// Middleware: Parse incoming JSON request bodies
app.use(express.json());

// Port configuration: use environment port (Render/Railway/cloud) or default to 3000
const PORT = process.env.PORT || 3000;

// Path to SQLite database file inside lab-04 directory
const dbPath = path.join(__dirname, 'books.db');

// Faculty requirement: Development JWT secret stored as a constant for Lab 4
// (Will be transitioned to .env in Lab 8 as per course syllabus)
const JWT_SECRET = 'DEVELOPMENT_JWT_SECRET_KEY_CSE_DS_IIB_2026';

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
// ROOT & METADATA ENDPOINTS
// =============================================================================

app.get('/', (req, res) => {
  res.status(200).json({
    course: 'Backend Development Fundamentals',
    lab: 'Lab 04 - Registration, Login and JWT Authentication',
    student: {
      name: 'Sree Charani (Grandhe Sree Charani)',
      registrationNumber: '252U1R3059',
      classAndSection: 'CSE-DS-IIB',
      yearAndTerm: 'II & II'
    },
    status: 'Server and SQLite Database are fully operational',
    endpoints: {
      auth: [
        'POST /register/ - Register a new user with bcrypt password hashing',
        'POST /login/    - Authenticate user credentials and return a signed JWT',
        'GET  /users     - Inspect registered users (demonstrating bcrypt hashes)'
      ],
      books: [
        'GET    /books - Retrieve books with search, sort, filter, and pagination',
        'GET    /books/:bookId - Retrieve a single book by ID',
        'POST   /books - Add a new book',
        'PUT    /books/:bookId - Update an existing book',
        'DELETE /books/:bookId - Delete a book by ID'
      ]
    }
  });
});

// =============================================================================
// LAB 04: AUTHENTICATION APIS (REGISTRATION & LOGIN)
// =============================================================================

/**
 * -----------------------------------------------------------------------------
 * API 1: User Registration
 * POST /register/ (also handles /register)
 * -----------------------------------------------------------------------------
 * Request Body:
 * {
 *   "username": "sreecharani",
 *   "name": "Sree Charani",
 *   "password": "mypassword123"
 * }
 *
 * Rules:
 * 1. Validate that username, name, and password are provided.
 * 2. Check if username already exists in the SQLite database.
 * 3. If duplicate, return 400 Bad Request with error message.
 * 4. Hash the password with bcrypt (salt rounds: 10).
 * 5. Insert username, name, and hashed password using parameterized query.
 * 6. Return 201 Created with {"message": "User created successfully"}.
 * 7. Never expose plain-text password or hash in response.
 */
const handleRegister = async (req, res) => {
  try {
    const { username, name, password } = req.body || {};

    // 1. Validation: check for missing or empty fields
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ message: 'Password is required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim();

    // 2. Check if the username already exists in SQLite
    const checkUserQuery = 'SELECT * FROM user WHERE LOWER(username) = ?;';
    const existingUser = await db.get(checkUserQuery, [cleanUsername]);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash the plain-text password with bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Insert user record into SQLite using parameterized query
    const insertUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?);
    `;
    await db.run(insertUserQuery, [cleanUsername, cleanName, hashedPassword]);

    // 5. Return success response (HTTP 201 Created)
    return res.status(201).json({
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('[Error] Registration failed:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

app.post('/register', handleRegister);
app.post('/register/', handleRegister);

/**
 * -----------------------------------------------------------------------------
 * API 2: User Login
 * POST /login/ (also handles /login)
 * -----------------------------------------------------------------------------
 * Request Body:
 * {
 *   "username": "sreecharani",
 *   "password": "mypassword123"
 * }
 *
 * Rules:
 * 1. Validate that username and password are provided.
 * 2. Search for the user in SQLite database.
 * 3. If user does not exist, return 400 Bad Request: {"message": "Invalid user"}.
 * 4. Retrieve the stored bcrypt password hash.
 * 5. Compare plain password with stored hash via bcrypt.compare().
 * 6. If password mismatch, return 400 Bad Request: {"message": "Invalid password"}.
 * 7. If valid, generate JWT using jwt.sign({ username: username }, secret).
 * 8. Return 200 OK with {"jwt_token": "..."}.
 * 9. Unsuccessful login must never generate a JWT.
 */
const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    // 1. Validation: check for missing fields
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ message: 'Password is required' });
    }

    const cleanUsername = username.trim().toLowerCase();

    // 2. Search for user in SQLite
    const getUserQuery = 'SELECT * FROM user WHERE LOWER(username) = ?;';
    const dbUser = await db.get(getUserQuery, [cleanUsername]);

    if (!dbUser) {
      // User not found in database
      return res.status(400).json({ message: 'Invalid user' });
    }

    // 3. Compare the entered password against the stored bcrypt hash
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (!isPasswordMatched) {
      // Password does not match
      return res.status(400).json({ message: 'Invalid password' });
    }

    // 4. Generate JWT with username payload only
    const payload = {
      username: dbUser.username
    };

    const jwtToken = jwt.sign(payload, JWT_SECRET);

    // 5. Return the generated token
    return res.status(200).json({
      jwt_token: jwtToken
    });
  } catch (error) {
    console.error('[Error] Login failed:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

app.post('/login', handleLogin);
app.post('/login/', handleLogin);

/**
 * -----------------------------------------------------------------------------
 * Utility Endpoint: Inspect Users (For lab verification & viva demonstration)
 * GET /users
 * Returns list of registered users showing that passwords are stored as bcrypt hashes.
 * -----------------------------------------------------------------------------
 */
app.get('/users', async (req, res) => {
  try {
    const users = await db.all('SELECT id, username, name, password FROM user;');
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// =============================================================================
// PRESERVED LAB 03 BOOK CATALOG REST ENDPOINTS
// =============================================================================

const ALLOWED_ORDER_BY_COLUMNS = ['id', 'title', 'author', 'price', 'pages'];
const ALLOWED_DIRECTIONS = ['ASC', 'DESC'];

function validateBookPayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a valid JSON object';
  }
  const { title, author, price, pages } = body;
  if (title === undefined || title === null || (typeof title === 'string' && title.trim() === '')) {
    return 'Title is required';
  }
  if (author === undefined || author === null || (typeof author === 'string' && author.trim() === '')) {
    return 'Author is required';
  }
  if (price === undefined || price === null || price === '') {
    return 'Price is required';
  }
  if (typeof price !== 'number' && isNaN(Number(price))) {
    return 'Price must be a number';
  }
  if (Number(price) < 0) {
    return 'Price must be a positive number';
  }
  if (pages !== undefined && pages !== null && pages !== '') {
    if (typeof pages !== 'number' && isNaN(Number(pages))) {
      return 'Pages must be a number';
    }
    if (Number(pages) < 0) {
      return 'Pages must be a positive number';
    }
  }
  return null;
}

// GET /books - Retrieve books with search, sort, filter, and pagination
app.get('/books', async (req, res) => {
  try {
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = '10',
      offset = '0',
      min_price,
      max_price
    } = req.query;

    const orderByCol = String(order_by).toLowerCase();
    if (!ALLOWED_ORDER_BY_COLUMNS.includes(orderByCol)) {
      return res.status(400).json({
        message: `Invalid 'order_by' parameter. Allowed values: ${ALLOWED_ORDER_BY_COLUMNS.join(', ')}`
      });
    }

    const orderDir = String(order).toUpperCase();
    if (!ALLOWED_DIRECTIONS.includes(orderDir)) {
      return res.status(400).json({
        message: `Invalid 'order' parameter. Allowed values: ${ALLOWED_DIRECTIONS.join(', ')}`
      });
    }

    const limitNum = Number(limit);
    if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum <= 0) {
      return res.status(400).json({
        message: "'limit' parameter must be a positive integer greater than 0"
      });
    }

    const offsetNum = Number(offset);
    if (isNaN(offsetNum) || !Number.isInteger(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        message: "'offset' parameter must be a non-negative integer (0 or greater)"
      });
    }

    let minPriceNum = null;
    if (min_price !== undefined) {
      minPriceNum = Number(min_price);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        return res.status(400).json({
          message: "'min_price' must be a valid non-negative number"
        });
      }
    }

    let maxPriceNum = null;
    if (max_price !== undefined) {
      maxPriceNum = Number(max_price);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        return res.status(400).json({
          message: "'max_price' must be a valid non-negative number"
        });
      }
    }

    if (minPriceNum !== null && maxPriceNum !== null && minPriceNum > maxPriceNum) {
      return res.status(400).json({
        message: "'min_price' cannot be greater than 'max_price'"
      });
    }

    const conditions = [];
    const params = [];

    if (search_q && String(search_q).trim() !== '') {
      conditions.push('title LIKE ?');
      params.push(`%${String(search_q).trim()}%`);
    }

    if (minPriceNum !== null) {
      conditions.push('price >= ?');
      params.push(minPriceNum);
    }

    if (maxPriceNum !== null) {
      conditions.push('price <= ?');
      params.push(maxPriceNum);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT *
      FROM book
      ${whereClause}
      ORDER BY ${orderByCol} ${orderDir}
      LIMIT ? OFFSET ?;
    `;
    params.push(limitNum, offsetNum);

    const books = await db.all(sql, params);
    return res.status(200).json(books);
  } catch (error) {
    console.error('[Error] GET /books failed:', error.message);
    return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

// GET /books/:bookId - Retrieve a single book
app.get('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ message: 'Invalid bookId. Must be a positive integer.' });
    }

    const book = await db.get('SELECT * FROM book WHERE id = ?;', [parsedId]);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST /books - Create a new book
app.post('/books', async (req, res) => {
  try {
    const validationError = validateBookPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, author, price, pages } = req.body;
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
      [
        title.trim(),
        author.trim(),
        Number(price),
        pages !== undefined && pages !== null && pages !== '' ? Number(pages) : null
      ]
    );

    return res.status(201).json({
      message: 'Book created successfully',
      bookId: result.lastID
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT /books/:bookId - Update a book
app.put('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ message: 'Invalid bookId. Must be a positive integer.' });
    }

    const existingBook = await db.get('SELECT * FROM book WHERE id = ?;', [parsedId]);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const validationError = validateBookPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, author, price, pages } = req.body;
    await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
      [
        title.trim(),
        author.trim(),
        Number(price),
        pages !== undefined && pages !== null && pages !== '' ? Number(pages) : null,
        parsedId
      ]
    );

    return res.status(200).json({
      message: 'Book updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE /books/:bookId - Delete a book
app.delete('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ message: 'Invalid bookId. Must be a positive integer.' });
    }

    const existingBook = await db.get('SELECT * FROM book WHERE id = ?;', [parsedId]);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await db.run('DELETE FROM book WHERE id = ?;', [parsedId]);

    return res.status(200).json({
      message: 'Book deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// =============================================================================
// DATABASE INITIALIZATION & SERVER STARTUP
// =============================================================================

const initializeDBAndServer = async () => {
  try {
    let resolvedDbPath = dbPath;

    // Serverless (e.g. Vercel) writable /tmp copy strategy
    if (process.env.VERCEL) {
      const tmpDbPath = path.join('/tmp', 'books.db');
      try {
        if (!fs.existsSync(tmpDbPath)) {
          if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, tmpDbPath);
          }
        }
        resolvedDbPath = tmpDbPath;
      } catch (copyErr) {
        console.warn('[Warning] Could not copy database to /tmp:', copyErr.message);
      }
    }

    // 1. Establish SQLite Connection
    db = await open({
      filename: resolvedDbPath,
      driver: sqlite3.Database
    });
    console.log(`[Database] SQLite connected successfully: ${resolvedDbPath}`);

    // 2. Create the 'user' table if it does not exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // 3. Create the 'book' table if it does not exist (Preserves Lab 3)
    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    // 4. Seed sample books if empty
    const rowCountResult = await db.get('SELECT COUNT(*) AS count FROM book;');
    if (rowCountResult.count === 0) {
      console.log('[Database] Table book is empty. Seeding 10 sample books...');
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
    }

    // 5. Start listening on specified port (if not serverless)
    let server = null;
    if (!process.env.VERCEL) {
      server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Server] Express server running on port ${PORT}`);
        console.log(`[Server] Available Auth endpoints:`);
        console.log(`         POST http://localhost:${PORT}/register/`);
        console.log(`         POST http://localhost:${PORT}/login/`);
        console.log(`         GET  http://localhost:${PORT}/users`);
        console.log(`[Server] Available Books endpoints:`);
        console.log(`         GET  http://localhost:${PORT}/books`);
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

// Export for testing and serverless handlers (Vercel)
app.app = app;
app.initializeDBAndServer = initializeDBAndServer;
module.exports = app;
