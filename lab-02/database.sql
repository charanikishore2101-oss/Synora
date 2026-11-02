-- =============================================================================
-- database.sql
-- ------------
-- Lab 02: SQLite Database and CRUD Routes
-- Student: Grandhe Sree Charani | Reg: 252U1R3059 | Section: CSE-DS-2B
-- =============================================================================

-- Step 1: Create the book table if it does not already exist
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    price INTEGER,
    pages INTEGER
);

-- Step 2: Insert 10 realistic sample book records
INSERT INTO book (title, author, price, pages) VALUES
('The Pragmatic Programmer', 'David Thomas & Andrew Hunt', 599, 352),
('Clean Code', 'Robert C. Martin', 650, 464),
('JavaScript: The Good Parts', 'Douglas Crockford', 399, 176),
('You Don''t Know JS: Scope & Closures', 'Kyle Simpson', 320, 98),
('Designing Data-Intensive Applications', 'Martin Kleppmann', 850, 616),
('Node.js Design Patterns', 'Mario Casciaro', 750, 660),
('Introduction to Algorithms', 'Thomas H. Cormen', 999, 1312),
('Database System Concepts', 'Abraham Silberschatz', 899, 1376),
('Eloquent JavaScript', 'Marijn Haverbeke', 480, 472),
('Refactoring', 'Martin Fowler', 720, 448);

-- =============================================================================
-- Verification Queries (Can be run in SQLite CLI or DB Browser for SQLite)
-- =============================================================================

-- 1. View all books
SELECT * FROM book;

-- 2. Count total books (should return 10 initially)
SELECT COUNT(*) AS total_books FROM book;

-- 3. Retrieve a single book by ID
SELECT * FROM book WHERE id = 1;

-- 4. Sample parameterized UPDATE query
-- UPDATE book SET title = 'Advanced Node.js', author = 'John Smith', price = 550, pages = 400 WHERE id = 1;

-- 5. Sample parameterized DELETE query
-- DELETE FROM book WHERE id = 1;
