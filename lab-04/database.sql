-- =============================================================================
-- Lab 04: Registration, Login and JWT Authentication
-- Student Name  : Sree Charani (Grandhe Sree Charani)
-- Reg. Number   : 252U1R3059
-- Class/Section : CSE-DS-IIB
-- Subject       : Backend Development Fundamentals
-- Database      : SQLite (books.db / database.db)
-- =============================================================================

-- 1. Create 'user' Table for Authentication
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL
);

-- 2. Preserved 'book' Table from Lab 3
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER
);

-- 3. Sample Queries for User Operations
-- Register a new user (with bcrypt hashed password)
-- INSERT INTO user (username, name, password) VALUES (?, ?, ?);

-- Find user by username
-- SELECT * FROM user WHERE username = ?;

-- List all users (to verify password hashing)
-- SELECT id, username, name, password FROM user;
