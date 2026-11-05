-- =============================================================================
-- database.sql
-- ------------
-- Lab 03: REST API, Query Parameters, Validation, and Debugging
-- Student Name  : Sree Charani (Grandhe Sree Charani)
-- Reg. Number   : 252U1R3059
-- Section       : CSE-DS-2B
-- Subject       : Backend Development Fundamentals
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
-- Lab 3 SQL Query Parameter Demonstrations
-- =============================================================================

-- 1. Search by partial title using LIKE (%...%)
-- Example: Search for books containing 'JavaScript'
SELECT * FROM book WHERE title LIKE '%JavaScript%';

-- 2. Price Range Filtering (min_price and max_price)
-- Example: Books with price between 400 and 700
SELECT * FROM book WHERE price >= 400 AND price <= 700;

-- 3. Sorting (order_by and order)
-- Example: Sort books by price in descending order
SELECT * FROM book ORDER BY price DESC;

-- Example: Sort books alphabetically by title in ascending order
SELECT * FROM book ORDER BY title ASC;

-- 4. Pagination (limit and offset)
-- Example: First page with limit 5 (records 1 to 5)
SELECT * FROM book LIMIT 5 OFFSET 0;

-- Example: Second page with limit 5 (records 6 to 10)
SELECT * FROM book LIMIT 5 OFFSET 5;

-- 5. Full Combined Query (Search + Filter + Sort + Pagination)
-- Parameterized format:
-- SELECT * FROM book WHERE title LIKE ? AND price >= ? AND price <= ? ORDER BY price DESC LIMIT ? OFFSET ?;
SELECT * FROM book 
WHERE title LIKE '%a%' 
  AND price >= 300 
  AND price <= 800 
ORDER BY price DESC 
LIMIT 3 OFFSET 0;

-- =============================================================================
-- Standard CRUD Operations
-- =============================================================================

-- Retrieve single book by ID
SELECT * FROM book WHERE id = 1;

-- Insert a new book
INSERT INTO book (title, author, price, pages) VALUES ('Mastering Express', 'Alex Johnson', 520, 310);

-- Update an existing book
UPDATE book SET title = 'Clean Code (2nd Edition)', author = 'Robert C. Martin', price = 700, pages = 480 WHERE id = 2;

-- Delete a book
DELETE FROM book WHERE id = 11;
