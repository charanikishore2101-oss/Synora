/**
 * verify-db.js
 * ------------
 * Database inspector for Lab 04: Registration, Login and JWT Authentication.
 * Prints database schema, tables, user count, book count, and user records.
 * Usage: node verify-db.js
 */

const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function verifyDatabase() {
  const dbPath = path.join(__dirname, 'books.db');
  console.log('================ Lab 04 SQLite Database Inspector ================');
  console.log(`Database File: ${dbPath}\n`);

  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // 1. Table Schemas
    console.log('--- 1. Table Schemas (sqlite_master) ---');
    const tables = await db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    for (const t of tables) {
      console.log(`\nTable [${t.name}]:\n${t.sql}`);
    }

    // 2. Count Records
    const userCountResult = await db.get("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name='user';");
    if (userCountResult.count > 0) {
      const userCount = await db.get('SELECT COUNT(*) AS count FROM user;');
      console.log(`\n--- 2. Record Counts ---`);
      console.log(`Total users in 'user' table: ${userCount.count}`);

      // 3. User Records (checking bcrypt hash)
      const users = await db.all('SELECT id, username, name, password FROM user;');
      if (users.length > 0) {
        console.log(`\n--- 3. Registered Users (Verifying bcrypt password hash) ---`);
        console.table(users);
        for (const u of users) {
          const isBcrypt = u.password.startsWith('$2b$') || u.password.startsWith('$2a$');
          console.log(`User: ${u.username} | Password format: ${isBcrypt ? '✅ Valid bcrypt hash ($2b$...)' : '❌ PLAIN TEXT DETECTED'}`);
        }
      } else {
        console.log("\n--- 3. Registered Users: (Table is empty. Run registration endpoint to create users) ---");
      }
    } else {
      console.log("\nTable 'user' does not exist yet. Run server.js to initialize it.");
    }

    const bookCount = await db.get('SELECT COUNT(*) AS count FROM book;');
    console.log(`Total books in 'book' table: ${bookCount.count}`);

    await db.close();
    console.log('\n================ Database Inspection Complete ================');
  } catch (err) {
    console.error('Error verifying database:', err.message);
  }
}

verifyDatabase();
