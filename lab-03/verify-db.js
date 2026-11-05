/**
 * verify-db.js
 * ------------
 * Lab 03 Database Verification Utility
 * Student: Sree Charani (252U1R3059) | Section: CSE-DS-2B
 *
 * Runs direct SQLite queries to verify schema, records, and query parameter filtering.
 * Usage: node verify-db.js
 */

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

async function inspectDatabase() {
  const dbPath = path.join(__dirname, 'books.db');
  console.log(`\n================ Lab 03 SQLite Database Inspector ================`);
  console.log(`Database File: ${dbPath}`);

  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // 1. Schema check
    console.log('\n--- 1. Table Schema (sqlite_master) ---');
    const tableInfo = await db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='book';");
    if (tableInfo.length > 0) {
      console.log(tableInfo[0].sql);
    } else {
      console.log("Table 'book' does not exist yet. Run 'npm start' first.");
      await db.close();
      return;
    }

    // 2. Count check
    console.log('\n--- 2. Record Count ---');
    const count = await db.get('SELECT COUNT(*) AS total_books FROM book;');
    console.log(`Total books in database: ${count.total_books}`);

    // 3. All Records
    console.log('\n--- 3. All Book Records (Ordered by ID ASC) ---');
    const books = await db.all('SELECT * FROM book ORDER BY id ASC;');
    console.table(books);

    // 4. Query Parameter Simulation: Search + Price Filter + Sort + Limit
    console.log('\n--- 4. Query Parameter Test (search_q="Script", min_price=350, max_price=600, order_by=price DESC) ---');
    const queryTest = await db.all(
      'SELECT * FROM book WHERE title LIKE ? AND price >= ? AND price <= ? ORDER BY price DESC LIMIT ? OFFSET ?;',
      ['%Script%', 350, 600, 5, 0]
    );
    console.table(queryTest);

    await db.close();
    console.log('================ Database Inspection Complete ================\n');
  } catch (error) {
    console.error('Error inspecting database:', error.message);
  }
}

inspectDatabase();
