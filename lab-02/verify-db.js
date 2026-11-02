/**
 * verify-db.js
 * ------------
 * Helper script to inspect books.db in the console, mimicking SQLite CLI.
 * Can be run anytime via: node verify-db.js
 */

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

async function inspectDatabase() {
  const dbPath = path.join(__dirname, 'books.db');
  console.log(`\n================ SQLite Database Viewer (${dbPath}) ================`);

  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // 1. Table schema
    console.log('\n--- 1. Table Schema (sqlite_master) ---');
    const tableInfo = await db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='book';");
    if (tableInfo.length > 0) {
      console.log(tableInfo[0].sql);
    } else {
      console.log("Table 'book' does not exist yet. Run 'npm start' first.");
      await db.close();
      return;
    }

    // 2. Total record count
    console.log('\n--- 2. Record Count (SELECT COUNT(*) FROM book;) ---');
    const count = await db.get('SELECT COUNT(*) AS total_books FROM book;');
    console.log(`Total books in database: ${count.total_books}`);

    // 3. All book records
    console.log('\n--- 3. All Records (SELECT * FROM book;) ---');
    const books = await db.all('SELECT * FROM book ORDER BY id ASC;');
    console.table(books);

    // 4. Sample single book query
    console.log('\n--- 4. Query Book by ID (SELECT * FROM book WHERE id = 1;) ---');
    const book1 = await db.get('SELECT * FROM book WHERE id = 1;');
    console.log(book1);

    await db.close();
    console.log('\n================ End of Database Report ================\n');
  } catch (error) {
    console.error('Error inspecting database:', error.message);
  }
}

inspectDatabase();
