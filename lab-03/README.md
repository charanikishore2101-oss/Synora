# Lab 03: REST API, Query Parameters, Validation, and Debugging

**Course:** Backend Development Fundamentals  
**Lab Number:** Lab 03  
**Academic Year:** 2025–2026  

---

## 👨‍🎓 Student Details

| Field | Details |
|---|---|
| **Student Name** | Sree Charani (Grandhe Sree Charani) |
| **Registration Number** | `252U1R3059` |
| **Class & Section** | CSE-DS-2B |
| **Department** | Computer Science & Engineering (Data Science) |
| **Subject** | Backend Development Fundamentals |
| **GitHub Repository** | [charanikishore2101-oss/Synora (lab-03)](https://github.com/charanikishore2101-oss/Synora/tree/main/lab-03) |
| **Live API Deployment** | [https://lab-03-team-innovex.vercel.app](https://lab-03-team-innovex.vercel.app) *(Direct: [https://lab-03-n03y21jyi-team-innovex.vercel.app](https://lab-03-n03y21jyi-team-innovex.vercel.app))* |

---

## 1. Executive Summary & Objective

The primary objective of **Lab 03** is to extend the foundation established in **Lab 02** (which introduced Node.js, Express, and fundamental SQLite database operations) into a production-grade, resource-oriented **RESTful API**. 

This lab enhances the book management application by implementing:
1. **Full CRUD Operations**: Following uniform REST design principles using standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
2. **Advanced Query Parameter Handling**:
   - Case-insensitive search on titles using SQL `LIKE` (`search_q`).
   - Server-side sorting with direction control (`order_by`, `order=ASC|DESC`).
   - Numeric price-range filtering (`min_price`, `max_price`).
   - Offset-based pagination (`limit`, `offset`) to handle large datasets efficiently.
3. **Robust Input & Parameter Validation**:
   - Whitelisting column identifiers and sort directions to prevent SQL injection.
   - Type verification and boundary checks on request bodies and query parameters.
   - Consistent JSON error response payloads (`{"message": "..."}`).
4. **Semantically Correct HTTP Status Codes**:
   - `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, and `500 Internal Server Error`.
5. **Systematic Backend Debugging**:
   - Identifying, diagnosing, and fixing the four classic backend defects: port conflicts (`EADDRINUSE`), path/module resolution failures, table name mismatches, and unawaited asynchronous promises.
6. **Automated & Postman Verification**:
   - A 56-assertion automated test suite (`npm test`).
   - A complete Postman collection (`postman_collection.json`) with visual screenshot evidence.

---

## 2. Technology Stack

In strict accordance with the syllabus guidelines, no heavyweight third-party libraries, TypeScript, ORMs (Prisma/TypeORM/Sequelize), or NoSQL databases were used.

| Technology | Version / Tool | Purpose in Project |
|---|---|---|
| **Node.js** | `v24.x` / `v20.x` | Asynchronous JavaScript runtime environment |
| **Express.js** | `^5.3.0` | Lightweight web application routing framework |
| **SQLite3** | `^6.0.1` | Self-contained, serverless relational database engine |
| **sqlite** | `^5.1.1` | Promise-based async/await wrapper for sqlite3 |
| **npm** | `v11.x` | Package manager and script runner |
| **Postman** | Latest Desktop / Web | API testing and endpoint contract verification |
| **Node Test Runner** | Native Node script | Automated 56-assertion test runner (`test-api.js`) |

---

## 3. Project Directory Structure

```text
lab-03/
├── api/
│   └── index.js                 # Vercel serverless function entry wrapper
├── screenshots/                 # High-resolution Postman test captures
│   ├── 01-get-all-books.png
│   ├── 02-get-book-by-id.png
│   ├── 03-post-create-book.png
│   ├── 04-put-update-book.png
│   ├── 05-delete-book.png
│   ├── 06-search-query.png
│   ├── 07-sort-price-desc.png
│   ├── 08-pagination-limit-offset.png
│   ├── 09-price-range-filter.png
│   ├── 10-validation-missing-title.png
│   ├── 11-validation-missing-author.png
│   ├── 12-validation-non-numeric-price.png
│   ├── 13-not-found-404.png
│   ├── 14-invalid-query-params.png
│   ├── 15-combined-query.png
│   ├── 16-sqlite-database.png
│   └── HOW_TO_CAPTURE.md
├── .gitignore                   # Excludes node_modules, .env, and local caches
├── books.db                     # SQLite database file seeded with initial records
├── database.sql                 # SQL schema definitions, DDL, and sample queries
├── generate-screenshots.js      # Headless test runner capturing all 16 screenshots
├── package.json                 # Project dependencies, scripts, and engine constraints
├── postman_collection.json      # Complete 16-test exportable Postman collection
├── README.md                    # Comprehensive laboratory report (this document)
├── server.js                    # Core Express server, REST endpoints, and validation
├── test-api.js                  # Automated 56-assertion integration test suite
├── vercel.json                  # Serverless deployment routing and build rules
└── verify-db.js                 # Database schema inspector and record printer
```

---

## 4. Database Schema & Architecture

The project reuses and extends the database architecture from Lab 02. The database is stored in a single binary SQLite file: `books.db`.

### 4.1 Table Definition (`book`)

```sql
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER
);
```

### 4.2 Seed Data (10 Realistic Technical Books)

| ID | Title | Author | Price (INR) | Pages |
|:--:|---|---|:---:|:---:|
| 1 | The Pragmatic Programmer (20th Anniversary Edition) | David Thomas & Andrew Hunt | ₹650 | 360 |
| 2 | Clean Code | Robert C. Martin | ₹650 | 464 |
| 3 | JavaScript: The Good Parts | Douglas Crockford | ₹399 | 176 |
| 4 | You Don't Know JS: Scope & Closures | Kyle Simpson | ₹320 | 98 |
| 5 | Designing Data-Intensive Applications | Martin Kleppmann | ₹850 | 616 |
| 6 | Node.js Design Patterns | Mario Casciaro | ₹750 | 660 |
| 7 | Introduction to Algorithms | Thomas H. Cormen | ₹999 | 1312 |
| 8 | Database System Concepts | Abraham Silberschatz | ₹899 | 1376 |
| 9 | Eloquent JavaScript | Marijn Haverbeke | ₹480 | 472 |
| 10 | Refactoring | Martin Fowler | ₹720 | 448 |

---

## 5. REST API Specification

All endpoints strictly follow REST architectural conventions: nouns for resources, plural path names, and standardized HTTP verbs.

| Method | Endpoint | Description | Request Body | Status Code |
|---|---|---|---|---|
| `GET` | `/` | API status, metadata, and quick-start links | None | `200 OK` |
| `GET` | `/books` | Retrieve books with search, sort, filter, and pagination | Query Parameters | `200 OK`, `400 Bad Request` |
| `GET` | `/books/:bookId` | Retrieve single book by primary key ID | None | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/books` | Create a new book record | JSON object (`title`, `author`, `price`, optional `pages`) | `201 Created`, `400 Bad Request` |
| `PUT` | `/books/:bookId` | Update an existing book record | JSON object (`title`, `author`, `price`, optional `pages`) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/books/:bookId` | Delete a book record by ID | None | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

## 6. Query Parameters & SQL Filtering Engine

Endpoint: `GET /books`

The query engine dynamically constructs safe, parameterized SQL queries based on client query string inputs.

### 6.1 Supported Query Parameters

| Parameter | Type | Default | Description & Validation Rules | Example |
|---|---|---|---|---|
| `search_q` | String | `""` | Partial case-insensitive substring match against `title` using SQL `LIKE`. | `?search_q=javascript` |
| `order_by` | String | `"id"` | Column name to sort results. Must be in whitelist: `['id', 'title', 'author', 'price', 'pages']`. | `?order_by=price` |
| `order` | String | `"ASC"` | Sort direction. Must be in whitelist: `['ASC', 'DESC']` (case-insensitive). | `?order=DESC` |
| `limit` | Integer | `10` | Maximum number of records to return. Must be a positive integer `> 0`. | `?limit=5` |
| `offset` | Integer | `0` | Number of initial records to skip. Must be an integer `>= 0`. | `?offset=10` |
| `min_price`| Number | `null` | Lower bound price filter. Must be a non-negative number. | `?min_price=400` |
| `max_price`| Number | `null` | Upper bound price filter. Must be `>= min_price`. | `?max_price=800` |

### 6.2 SQL Injection Prevention (Defense-in-Depth)

SQL Injection happens when untrusted user inputs are concatenated directly into SQL command strings (e.g., `WHERE title = '` + input + `'`). 

Our implementation employs two complementary defensive patterns:

1. **Parameterized Queries (`?` placeholders)**:
   All values provided by users (`search_q`, `min_price`, `max_price`, `limit`, `offset`) are passed into SQLite via query parameters:
   ```javascript
   const conditions = [];
   const params = [];

   if (search_q) {
     conditions.push('title LIKE ?');
     params.push(`%${search_q}%`);
   }
   if (min_price !== undefined) {
     conditions.push('price >= ?');
     params.push(minPriceNum);
   }
   ```
   SQLite treats these parameters strictly as literal data, preventing attacker input from altering query grammar.

2. **Strict Whitelisting for Column & Direction Names**:
   SQL dialects do not permit placeholders in `ORDER BY column_name ASC|DESC`. Therefore, user inputs are validated against strict in-memory arrays before being inserted into the SQL string:
   ```javascript
   const ALLOWED_ORDER_BY = ['id', 'title', 'author', 'price', 'pages'];
   const ALLOWED_DIRECTIONS = ['ASC', 'DESC'];

   if (!ALLOWED_ORDER_BY.includes(orderByCol)) {
     return res.status(400).json({ 
       message: `Invalid 'order_by' parameter. Allowed values: ${ALLOWED_ORDER_BY.join(', ')}` 
     });
   }
   if (!ALLOWED_DIRECTIONS.includes(orderDir)) {
     return res.status(400).json({ 
       message: `Invalid 'order' parameter. Allowed values: ASC, DESC` 
     });
   }
   ```

---

## 7. Input Validation & Error Handling

### 7.1 Validation Rules for `POST /books` and `PUT /books/:bookId`

Every incoming payload is validated before any database interaction:

1. **Missing or Empty Title**:
   - Check: `typeof title !== 'string' || title.trim() === ''`
   - Response: `400 Bad Request` → `{"message": "Title is required"}`
2. **Missing or Empty Author**:
   - Check: `typeof author !== 'string' || author.trim() === ''`
   - Response: `400 Bad Request` → `{"message": "Author is required"}`
3. **Missing Price**:
   - Check: `price === undefined || price === null || price === ''`
   - Response: `400 Bad Request` → `{"message": "Price is required"}`
4. **Non-Numeric Price**:
   - Check: `typeof price !== 'number' && isNaN(Number(price))`
   - Response: `400 Bad Request` → `{"message": "Price must be a number"}`
5. **Negative Price**:
   - Check: `Number(price) < 0`
   - Response: `400 Bad Request` → `{"message": "Price must be a positive number"}`
6. **Non-Existing Resource (PUT & DELETE)**:
   - Check: `existingBook === undefined`
   - Response: `404 Not Found` → `{"message": "Book not found"}`

---

## 8. Section 7: Backend Debugging Exercise

In real-world backend engineering, diagnosing runtime anomalies requires deep knowledge of the Node.js event loop, operating system networking, module resolution, and database drivers. Below is the systematic analysis of the four required debugging exercises.

---

### Scenario 1: Port Conflict (`EADDRINUSE`)

#### 1. Root Cause
The operating system prevents multiple processes from binding to the exact same TCP IP and port combination simultaneously. When starting an Express server with `app.listen(3000)`, if a previous instance is already listening on port 3000 (such as an orphaned background node process or another server), the kernel returns the POSIX error `EADDRINUSE` (Error: Address Already In Use).

#### 2. Error Stack Trace
```text
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1898:16)
    at listenInCluster (node:net:1955:12)
    at Server.listen (node:net:2053:7)
    at Function.listen (C:\...\node_modules\express\lib\application.js:639:24)
    at initializeDBAndServer (C:\...\server.js:45:9)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1934:8)
```

#### 3. Buggy Implementation vs. Professional Solution

**Buggy Code:**
```javascript
// Hardcoded port with no fallback or error handler
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Professional Solution:**
1. Dynamic port allocation using environment variables with fallback:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```
2. Graceful error handling for `EADDRINUSE`:
   ```javascript
   const server = app.listen(PORT, () => {
     console.log(`Server running at http://localhost:${PORT}/`);
   });

   server.on('error', (err) => {
     if (err.code === 'EADDRINUSE') {
       console.error(`⚠️ Port ${PORT} is busy. Falling back to port ${Number(PORT) + 1}...`);
       server.listen(Number(PORT) + 1);
     } else {
       throw err;
     }
   });
   ```
3. Command-line termination of the blocking process:
   - **Windows PowerShell**:
     ```powershell
     Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
     ```
   - **Linux / macOS**:
     ```bash
     lsof -ti:3000 | xargs kill -9
     ```

---

### Scenario 2: Incorrect Import or File Path (`MODULE_NOT_FOUND` / `ENOENT`)

#### 1. Root Cause
Node.js CommonJS uses relative file path resolution starting from the directory of the file calling `require()`. A typo in the module name or using a relative file path that assumes the current working directory (`process.cwd()`) rather than `__dirname` causes Node to throw `MODULE_NOT_FOUND` for modules or `ENOENT` (Error: No Entry) for filesystem calls.

#### 2. Error Stack Trace
```text
node:internal/modules/cjs/loader:1459
  throw err;
  ^

Error: Cannot find module './routes/books'
Require stack:
- C:\Users\SREE CHARANI\OneDrive\Desktop\My Projects\LUMA\lab-03\server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)
    at Module._load (node:internal/modules/cjs/loader:1242:25)
    at Module.require (node:internal/modules/cjs/loader:1556:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (C:\...\server.js:5:19) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ 'C:\\...\\server.js' ]
}
```

#### 3. Buggy Implementation vs. Professional Solution

**Buggy Code:**
```javascript
// Relative path assuming execution from root, breaks when started from subdirectories
const dbPath = './books.db'; 
const bookRoutes = require('./routes/bookRoutes.js'); // Typo or missing file
```

**Professional Solution:**
1. Always construct absolute paths using Node's standard `path.join(__dirname, ...)`:
   ```javascript
   const path = require('path');
   const dbPath = path.join(__dirname, 'books.db');
   ```
2. Check that the required module is listed in `package.json` dependencies and properly installed in `node_modules`:
   ```bash
   npm install sqlite sqlite3 express
   ```

---

### Scenario 3: Incorrect SQLite Table Name (`SQLITE_ERROR: no such table`)

#### 1. Root Cause
SQLite validates SQL syntax at statement compile time. If an endpoint attempts to query `books` (plural) while the schema was defined as `book` (singular) in `CREATE TABLE book (...)`, SQLite throws an immediate syntax/schema error: `SQLITE_ERROR: no such table: books`.

#### 2. Error Stack Trace
```text
SQLITE_ERROR: no such table: books
    at Statement.all (C:\...\node_modules\sqlite\build\Database.js:77:28)
    at C:\...\server.js:89:32
    at Layer.handle [as handle_request] (C:\...\node_modules\express\lib\router\layer.js:95:5)
    at next (C:\...\node_modules\express\lib\router\route.js:149:13)
```

#### 3. Buggy Implementation vs. Professional Solution

**Buggy Code:**
```javascript
// Schema created with: CREATE TABLE book (id INTEGER PRIMARY KEY...);
app.get('/books', async (req, res) => {
  // Bug: 'books' does not exist in SQLite catalog
  const books = await db.all('SELECT * FROM books'); 
  res.json(books);
});
```

**Professional Solution:**
1. Maintain consistent table naming conventions across all SQL queries:
   ```javascript
   const TABLE_NAME = 'book';
   const books = await db.all(`SELECT * FROM ${TABLE_NAME};`);
   ```
2. Verify table existence during server initialization using SQLite's schema catalog:
   ```javascript
   const tableCheck = await db.get(
     "SELECT name FROM sqlite_master WHERE type='table' AND name='book';"
   );
   if (!tableCheck) {
     console.warn("Table 'book' does not exist! Running database initialization script...");
     await db.exec(`
       CREATE TABLE IF NOT EXISTS book (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         title TEXT NOT NULL,
         author TEXT NOT NULL,
         price INTEGER NOT NULL,
         pages INTEGER
       );
     `);
   }
   ```

---

### Scenario 4: Missing `await` in Asynchronous Database Operations

#### 1. Root Cause
Database driver operations (`db.get()`, `db.all()`, `db.run()`) return JavaScript `Promise` objects. When a developer forgets the `await` keyword in an `async` function, JavaScript does not wait for the I/O operation to complete. Instead, it assigns the unresolved `Promise` object directly to the variable.
- Calling `res.json(books)` serializes the empty `{}` Promise object instead of the actual array of books.
- The HTTP response is dispatched to the client before the database query finishes, resulting in race conditions or missing data.

#### 2. Buggy Implementation vs. Professional Solution

**Buggy Code:**
```javascript
// Bug: Missing 'await' before db.all()
app.get('/books', async (req, res) => {
  const books = db.all('SELECT * FROM book'); // books is Promise { <pending> }
  res.json(books); // Serializes to "{}" in JSON output!
});

// Bug: Missing 'await' before db.run()
app.post('/books', async (req, res) => {
  db.run('INSERT INTO book (title, author, price) VALUES (?, ?, ?)', [title, author, price]);
  // Client is told "Created" before the database has actually written the row!
  res.status(201).json({ message: 'Book created' });
});
```

**Professional Solution:**
1. Always `await` asynchronous database queries inside `try...catch` blocks:
   ```javascript
   app.get('/books', async (req, res) => {
     try {
       const books = await db.all('SELECT * FROM book');
       res.status(200).json(books);
     } catch (err) {
       console.error('Database query error:', err.message);
       res.status(500).json({ message: 'Internal Server Error' });
     }
   });
   ```
2. For mutations, await `db.run()` and inspect `result.lastID`:
   ```javascript
   app.post('/books', async (req, res) => {
     try {
       const result = await db.run(
         'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)',
         [title.trim(), author.trim(), Number(price), pages ? Number(pages) : null]
       );
       res.status(201).json({ 
         message: 'Book created successfully',
         bookId: result.lastID 
       });
     } catch (err) {
       res.status(500).json({ message: 'Internal Server Error' });
     }
   });
   ```

---

## 9. Postman Testing Guide & Verification Evidence

All 16 required test scenarios were executed and verified. The complete collection is available in `postman_collection.json`.

### 9.1 Summary of All 16 Test Scenarios

| Test # | Test Scenario | HTTP Method | Endpoint / Query String | Request Body | Status Code | Expected Response Key |
|:---:|---|:---:|---|---|:---:|---|
| **01** | Retrieve all books | `GET` | `/books` | None | `200 OK` | Array of 10 books |
| **02** | Retrieve single book by ID | `GET` | `/books/1` | None | `200 OK` | Object with `id: 1` |
| **03** | Create book with valid data | `POST` | `/books` | `{"title":"Mastering Full-Stack Node.js",...}` | `201 Created` | `{"message":"Book created successfully","bookId":...}` |
| **04** | Update an existing book | `PUT` | `/books/1` | `{"title":"The Pragmatic Programmer (20th Anniv.)",...}` | `200 OK` | `{"message":"Book updated successfully"}` |
| **05** | Delete an existing book | `DELETE`| `/books/10` | None | `200 OK` | `{"message":"Book deleted successfully"}` |
| **06** | Search books by partial title | `GET` | `/books?search_q=JavaScript` | None | `200 OK` | Filtered array containing "JavaScript" |
| **07** | Sort books descending by price | `GET` | `/books?order_by=price&order=DESC` | None | `200 OK` | Books ordered ₹999 down to ₹320 |
| **08** | Pagination with limit and offset | `GET` | `/books?limit=4&offset=0` | None | `200 OK` | Exactly 4 books |
| **09** | Filter books by price range | `GET` | `/books?min_price=400&max_price=700` | None | `200 OK` | Books with prices between ₹400 and ₹700 |
| **10** | Validation: missing title | `POST` | `/books` | `{"author":"Robert C. Martin","price":500}` | `400 Bad Request` | `{"message":"Title is required"}` |
| **11** | Validation: missing author | `POST` | `/books` | `{"title":"Clean Architecture","price":550}` | `400 Bad Request` | `{"message":"Author is required"}` |
| **12** | Validation: non-numeric price | `POST` | `/books` | `{"title":"Refactoring","author":"Fowler","price":"expensive"}` | `400 Bad Request` | `{"message":"Price must be a number"}` |
| **13** | Non-existing book ID | `GET` | `/books/999` | None | `404 Not Found` | `{"message":"Book not found"}` |
| **14** | Invalid query parameter | `GET` | `/books?order_by=invalid_column` | None | `400 Bad Request` | `{"message":"Invalid 'order_by' parameter..."}` |
| **15** | Combined query parameters | `GET` | `/books?search_q=a&min_price=300&max_price=850&order_by=price&order=DESC&limit=3&offset=0` | None | `200 OK` | Filtered, sorted, paginated results |
| **16** | Database state verification | `GET` | `/books` (direct inspect) | None | `200 OK` | Verified table schema and row persistence |

---

### 9.2 Visual Verification Screenshots

All screenshots were generated from the live API responses:

#### 1. Retrieve All Books (`GET /books`)
![01-get-all-books](./screenshots/01-get-all-books.png)

#### 2. Retrieve Book by ID (`GET /books/1`)
![02-get-book-by-id](./screenshots/02-get-book-by-id.png)

#### 3. Create Book with Valid Data (`POST /books`)
![03-post-create-book](./screenshots/03-post-create-book.png)

#### 4. Update Existing Book (`PUT /books/1`)
![04-put-update-book](./screenshots/04-put-update-book.png)

#### 5. Delete Existing Book (`DELETE /books/10`)
![05-delete-book](./screenshots/05-delete-book.png)

#### 6. Search Query Parameter (`GET /books?search_q=JavaScript`)
![06-search-query](./screenshots/06-search-query.png)

#### 7. Sorting by Price Descending (`GET /books?order_by=price&order=DESC`)
![07-sort-price-desc](./screenshots/07-sort-price-desc.png)

#### 8. Pagination with Limit and Offset (`GET /books?limit=4&offset=0`)
![08-pagination-limit-offset](./screenshots/08-pagination-limit-offset.png)

#### 9. Price Range Filtering (`GET /books?min_price=400&max_price=700`)
![09-price-range-filter](./screenshots/09-price-range-filter.png)

#### 10. Validation Failure: Missing Title (`POST /books`)
![10-validation-missing-title](./screenshots/10-validation-missing-title.png)

#### 11. Validation Failure: Missing Author (`POST /books`)
![11-validation-missing-author](./screenshots/11-validation-missing-author.png)

#### 12. Validation Failure: Non-Numeric Price (`POST /books`)
![12-validation-non-numeric-price](./screenshots/12-validation-non-numeric-price.png)

#### 13. Resource Not Found: 404 Status Code (`GET /books/999`)
![13-not-found-404](./screenshots/13-not-found-404.png)

#### 14. Invalid Query Parameter Validation (`GET /books?order_by=invalid_column`)
![14-invalid-query-params](./screenshots/14-invalid-query-params.png)

#### 15. Combined Complex Query (`GET /books?search_q=a&min_price=300&max_price=850...`)
![15-combined-query](./screenshots/15-combined-query.png)

#### 16. SQLite Database Table and Record Inspection
![16-sqlite-database](./screenshots/16-sqlite-database.png)

---

## 10. Automated Integration Testing (`npm test`)

The repository includes a comprehensive automated test suite (`test-api.js`) that boots a local server instance and asserts **56 individual conditions**:

```bash
$ npm test

> lab-03-rest-api@1.0.0 test
> node test-api.js

[Test Setup] Starting local Express server on port 3000...

=============================================================
🧪 Starting Lab 03 Automated REST API & Validation Tests
=============================================================

✅ PASS: 0. GET / returns 200 OK
✅ PASS: 1. Retrieve all books (GET /books) returns 200 OK
✅ PASS: 1.1 GET /books returns an array
✅ PASS: 1.2 GET /books returns all books (got 10)
✅ PASS: 2. Retrieve book by ID (GET /books/1) returns 200 OK
✅ PASS: 2.1 Returned book ID matches 1 (title: "The Pragmatic Programmer...")
✅ PASS: 3. Create book with valid data (POST /books) returns 201 Created
✅ PASS: 3.1 Returns newly created bookId: 24
✅ PASS: 3.2 GET created book returns 200 OK
✅ PASS: 3.3 Created book title verified in database
✅ PASS: 4. Update existing book (PUT /books/:id) returns 200 OK
✅ PASS: 4.1 PUT returns success message
✅ PASS: 4.2 Updated book title verified in SQLite
✅ PASS: 4.3 Updated book price verified in SQLite
✅ PASS: 5. Delete existing book (DELETE /books/:id) returns 200 OK
✅ PASS: 5.1 DELETE returns success message
✅ PASS: 5.2 GET deleted book returns 404 Not Found (confirmed removed from DB)
✅ PASS: 6. Search books using search_q returns 200 OK
✅ PASS: 6.1 search_q=JavaScript found 2 record(s)
✅ PASS: 6.2 All returned books match search title pattern
✅ PASS: 7.1 Sort books by price ASC returns 200 OK
✅ PASS: 7.2 Lowest price book appears first in ASC sort
✅ PASS: 7.3 Sort books by price DESC returns 200 OK
✅ PASS: 7.4 Highest price book appears first in DESC sort
✅ PASS: 8.1 Pagination limit=4 returns 200 OK
✅ PASS: 8.2 Exactly 4 books returned for limit=4 (got 4)
✅ PASS: 8.3 Pagination limit=4&offset=4 returns 200 OK
✅ PASS: 8.4 Page 2 first record is different from Page 1 first record
✅ PASS: 9.1 Filter min_price=400&max_price=700 returns 200 OK
✅ PASS: 9.2 All returned books are strictly within [400, 700] INR
✅ PASS: 10. Create book with missing title returns 400 Bad Request
✅ PASS: 10.1 Error message matches: "Title is required"
✅ PASS: 11. Create book with missing author returns 400 Bad Request
✅ PASS: 11.1 Error message matches: "Author is required"
✅ PASS: 12. Create book with non-numeric price returns 400 Bad Request
✅ PASS: 12.1 Error message matches: "Price must be a number"
✅ PASS: 12.2 Create book with negative price returns 400 Bad Request
✅ PASS: 12.3 Error message matches: "Price must be a positive number"
✅ PASS: 13. Retrieve non-existing book ID returns 404 Not Found
✅ PASS: 13.1 Returns standardized 404 message: "Book not found"
✅ PASS: 14. Update non-existing book ID returns 404 Not Found
✅ PASS: 14.1 Returns standardized 404 message: "Book not found"
✅ PASS: 15. Delete non-existing book ID returns 404 Not Found
✅ PASS: 15.1 Returns standardized 404 message: "Book not found"
✅ PASS: 16.1 Invalid order_by column returns 400 Bad Request
✅ PASS: 16.1b Expected message for invalid order_by
✅ PASS: 16.2 Invalid order direction returns 400 Bad Request
✅ PASS: 16.2b Expected message for invalid order direction
✅ PASS: 16.3 Negative limit returns 400 Bad Request
✅ PASS: 16.4 Negative offset returns 400 Bad Request
✅ PASS: 16.5 min_price > max_price returns 400 Bad Request
✅ PASS: 16.5b Cross-price validation error verified
✅ PASS: 16.6 Invalid bookId parameter (GET /books/abc) returns 400 Bad Request
✅ PASS: 17. Combined Search + Filter + Sort + Pagination returns 200 OK
✅ PASS: 17.1 Respects limit 3 (got 3)
✅ PASS: 18. Direct SQLite verification: exactly 10 books in database after clean lifecycle test (count: 10)

=============================================================
🏁 Test Summary: 56 Passed, 0 Failed
=============================================================
```

---

## 11. Setup & Local Execution Instructions

### 11.1 Prerequisites
- Node.js `v18.0.0` or higher installed (`node -v`).
- npm package manager (`npm -v`).
- Postman or any HTTP client (such as cURL).

### 11.2 Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/charanikishore2101-oss/Synora.git
   cd Synora/lab-03
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Inspect the database**:
   ```bash
   node verify-db.js
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # Server will start with nodemon at http://localhost:3000
   ```

5. **Run automated test suite**:
   ```bash
   npm test
   ```

---

## 12. Deployment Architecture & Cloud Notes

### 12.1 Vercel Serverless Function Deployment

The project is structured to deploy smoothly to **Vercel** serverless functions via `vercel.json` and `api/index.js`.

#### Critical Insight on SQLite in Serverless Environments:
Vercel functions run in read-only AWS Lambda microVMs. Attempting to write (`INSERT`, `UPDATE`, `DELETE`) to the root SQLite database file results in:
`SQLITE_READONLY: attempt to write a readonly database`

**Solution Implemented in `server.js`:**
```javascript
let dbPath = path.join(__dirname, 'books.db');

if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'books.db');
  try {
    if (!fs.existsSync(tmpDbPath)) {
      fs.copyFileSync(dbPath, tmpDbPath);
    }
    dbPath = tmpDbPath;
  } catch (err) {
    console.error('Failed to copy books.db to /tmp:', err.message);
  }
}
```
On Vercel, the database is dynamically mirrored into the `/tmp` scratchpad directory where write operations are fully supported.

---

## 13. College Viva Voce Preparation (Questions & Answers)

### Q1: What makes an API "RESTful"?
**Answer:** REST (Representational State Transfer) is an architectural style based on uniform resource identifiers (URIs), standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`), stateless interactions, and standardized HTTP status codes (`200`, `201`, `400`, `404`, `500`). Resources are represented as nouns (e.g., `/books`), never actions (e.g., NOT `/getAllBooks` or `/deleteBook`).

### Q2: What is the difference between Route Parameters and Query Parameters?
**Answer:**
- **Route Parameters** (e.g., `/books/:bookId`) identify a **specific resource**. They are mandatory parts of the URL path hierarchy.
- **Query Parameters** (e.g., `/books?search_q=js&limit=5`) are used for **filtering, sorting, searching, and paginating** resource collections. They are optional and appear after the `?` delimiter.

### Q3: Why is SQL Injection a danger, and how does this project prevent it?
**Answer:** SQL Injection occurs when user input is concatenated directly into SQL command strings, allowing attackers to execute arbitrary database queries (e.g., `' OR '1'='1`). We prevent this using **parameterized queries** (`?` placeholders) for all user values, and **strict whitelisting** for dynamic identifiers like `order_by` columns and `order` directions.

### Q4: Why can't SQL placeholders (`?`) be used for column names in `ORDER BY`?
**Answer:** In SQL standards, placeholders (`?`) can only replace literal values (strings, numbers). They cannot replace structural query identifiers like table names, column names, or keywords like `ASC`/`DESC`. To keep `ORDER BY` safe, we validate column names against an allowed array (`['id', 'title', 'author', 'price', 'pages']`) before string insertion.

### Q5: What is the difference between `PUT` and `POST` in REST?
**Answer:**
- `POST` creates a **new resource**. The server assigns the unique identifier (ID) and responds with `201 Created`. `POST` is not idempotent (calling it multiple times creates multiple records).
- `PUT` replaces or updates an **existing resource** identified by its URI (e.g., `/books/1`). `PUT` is idempotent (calling it multiple times with the same payload results in the exact same database state).

### Q6: What does the `EADDRINUSE` error mean and how do you resolve it?
**Answer:** `EADDRINUSE` means the TCP port specified (e.g., 3000) is already actively held by another running process. It can be resolved by killing the conflicting process (`Stop-Process` on Windows, `kill` on Linux), or configuring the server to read `process.env.PORT` dynamically.

### Q7: Why must database operations in Node.js be asynchronous with `await`?
**Answer:** Node.js runs on a single-threaded event loop. Database I/O is slow compared to CPU execution. Making database calls asynchronous prevents the single thread from blocking other incoming HTTP requests. Using `await` pauses only the execution of that specific `async` function until SQLite returns the data, without freezing the entire Node process.

### Q8: What is the significance of HTTP Status Code 400 vs 404?
**Answer:**
- `400 Bad Request`: The client sent invalid data (e.g., missing required fields, negative price, invalid sort column).
- `404 Not Found`: The client sent a valid request, but the requested resource URI does not exist in the database (e.g., `/books/999`).

---

## 14. Lab 03 Requirements Completion Checklist

- [x] **Extend Lab 2 Foundation**: Reused Express, SQLite, `books.db`, and books schema.
- [x] **5 Core REST Endpoints**: Implemented `GET /books`, `GET /books/:id`, `POST /books`, `PUT /books/:id`, `DELETE /books/:id`.
- [x] **Search Parameter (`search_q`)**: Case-insensitive partial title matching using SQL `LIKE`.
- [x] **Sorting Parameters (`order_by`, `order`)**: Whitelisted columns with `ASC` and `DESC` support.
- [x] **Pagination Parameters (`limit`, `offset`)**: Integer validation with safe defaults (`limit=10`, `offset=0`).
- [x] **Price Range Filtering (`min_price`, `max_price`)**: Numerical range checks with cross-field validation (`min_price <= max_price`).
- [x] **Input Validation**: Strict rules for `title`, `author`, and positive numeric `price`.
- [x] **Standardized Error Format**: Consistent JSON responses (`{"message": "..."}`).
- [x] **HTTP Status Codes**: Accurate usage of `200`, `201`, `400`, `404`, and `500`.
- [x] **Section 7 Debugging Exercise**: Detailed technical analysis and solutions for all 4 scenarios.
- [x] **Postman Testing List**: All 16 required test scenarios documented and tested.
- [x] **Screenshot Evidence**: 16 high-resolution response captures saved in `lab-03/screenshots/`.
- [x] **Automated Test Suite**: 56-assertion automated test suite passing cleanly (`npm test`).
- [x] **GitHub Submission**: Organized inside `lab-03/` with clean `.gitignore`.
- [x] **Cloud Deployment Prepared**: Vercel configuration (`vercel.json`) with writable `/tmp` database logic.

---

**Prepared by:**  
**Sree Charani (Grandhe Sree Charani)**  
Reg. No: `252U1R3059`  
Class & Section: CSE-DS-2B  
Department of Computer Science & Engineering (Data Science)
