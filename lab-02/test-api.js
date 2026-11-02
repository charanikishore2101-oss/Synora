/**
 * test-api.js
 * -----------
 * Automated test suite for Lab 02: SQLite Database and CRUD Routes.
 * Tests all 5 endpoints, status codes, validations, and database mutations.
 * Can be run standalone via: npm test
 */

const { spawn, execSync } = require('child_process');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function isServerRunning() {
  try {
    const res = await fetch(`${BASE_URL}/`);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function runTests() {
  let serverProcess = null;

  const alreadyRunning = await isServerRunning();
  if (!alreadyRunning) {
    console.log('[Test Setup] Starting server on port 3000...');
    serverProcess = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true
    });

    let ready = false;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      if (await isServerRunning()) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      console.error('Failed to start server for automated tests.');
      if (serverProcess && serverProcess.pid) {
        try { execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' }); } catch {}
      }
      process.exit(1);
    }
  }

  console.log('\n====================================================');
  console.log('🧪 Starting Lab 02 Automated CRUD & Validation Tests');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Root route
    const rootRes = await fetch(`${BASE_URL}/`);
    assert(rootRes.status === 200, 'GET / returns 200 OK');

    // 2. GET /books/
    const getAllRes = await fetch(`${BASE_URL}/books/`);
    const allBooks = await getAllRes.json();
    assert(getAllRes.status === 200, 'GET /books/ returns 200 OK');
    assert(Array.isArray(allBooks), 'GET /books/ returns an array');
    assert(allBooks.length >= 10, `GET /books/ returns initial 10 books (got ${allBooks.length})`);
    assert(allBooks[0].title && allBooks[0].author && allBooks[0].price && allBooks[0].pages, 'Book objects contain all required properties');

    // 3. GET /books/1/
    const getOneRes = await fetch(`${BASE_URL}/books/1/`);
    const bookOne = await getOneRes.json();
    assert(getOneRes.status === 200, 'GET /books/1/ returns 200 OK');
    assert(bookOne.id === 1, `GET /books/1/ returns book with id 1 (title: "${bookOne.title}")`);

    // 4. GET /books/:bookId/ - Not Found
    const getNotFoundRes = await fetch(`${BASE_URL}/books/99999/`);
    const notFoundData = await getNotFoundRes.json();
    assert(getNotFoundRes.status === 404, 'GET /books/99999/ returns 404 Not Found');
    assert(notFoundData.error !== undefined, 'GET /books/99999/ returns error message');

    // 5. GET /books/:bookId/ - Invalid ID
    const getInvalidIdRes = await fetch(`${BASE_URL}/books/abc/`);
    const invalidIdData = await getInvalidIdRes.json();
    assert(getInvalidIdRes.status === 400, 'GET /books/abc/ returns 400 Bad Request');
    assert(invalidIdData.error !== undefined, 'GET /books/abc/ returns validation error message');

    // 6. POST /books/ - Add New Book
    const newBookPayload = {
      title: 'Learning Node.js',
      author: 'John Smith',
      price: 450,
      pages: 320
    };
    const postRes = await fetch(`${BASE_URL}/books/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBookPayload)
    });
    const postData = await postRes.json();
    assert(postRes.status === 201, 'POST /books/ returns 201 Created');
    assert(postData.bookId !== undefined, `POST /books/ returns newly created bookId: ${postData.bookId}`);
    const createdBookId = postData.bookId;

    // 7. GET newly created book to verify persistence in SQLite
    const verifyPostRes = await fetch(`${BASE_URL}/books/${createdBookId}/`);
    const verifyPostBook = await verifyPostRes.json();
    assert(verifyPostRes.status === 200, 'GET newly created book returns 200 OK');
    assert(verifyPostBook.title === 'Learning Node.js', 'Newly created book title verified in database');
    assert(verifyPostBook.price === 450, 'Newly created book price verified in database');

    // 8. POST /books/ - Validation failure (missing fields)
    const postMissingRes = await fetch(`${BASE_URL}/books/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Incomplete Book' })
    });
    assert(postMissingRes.status === 400, 'POST /books/ with missing fields returns 400 Bad Request');

    // 9. POST /books/ - Validation failure (invalid price <= 0)
    const postInvalidPriceRes = await fetch(`${BASE_URL}/books/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Bad Price', author: 'Author', price: -50, pages: 100 })
    });
    assert(postInvalidPriceRes.status === 400, 'POST /books/ with negative price returns 400 Bad Request');

    // 10. POST /books/ - Validation failure (invalid pages not integer)
    const postInvalidPagesRes = await fetch(`${BASE_URL}/books/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Bad Pages', author: 'Author', price: 200, pages: 12.5 })
    });
    assert(postInvalidPagesRes.status === 400, 'POST /books/ with decimal pages returns 400 Bad Request');

    // 11. PUT /books/:bookId/ - Update Book
    const updatePayload = {
      title: 'Advanced Node.js',
      author: 'John Smith',
      price: 550,
      pages: 400
    };
    const putRes = await fetch(`${BASE_URL}/books/${createdBookId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    const putData = await putRes.json();
    assert(putRes.status === 200, 'PUT /books/:bookId/ returns 200 OK');
    assert(putData.message === 'Book updated successfully', 'PUT returns success message');

    // 12. Verify updated book details
    const verifyPutRes = await fetch(`${BASE_URL}/books/${createdBookId}/`);
    const verifyPutBook = await verifyPutRes.json();
    assert(verifyPutBook.title === 'Advanced Node.js', 'Updated book title verified in SQLite');
    assert(verifyPutBook.price === 550, 'Updated book price verified in SQLite');
    assert(verifyPutBook.pages === 400, 'Updated book pages verified in SQLite');

    // 13. PUT /books/:bookId/ - Not Found
    const putNotFoundRes = await fetch(`${BASE_URL}/books/99999/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    assert(putNotFoundRes.status === 404, 'PUT /books/99999/ returns 404 Not Found');

    // 14. DELETE /books/:bookId/ - Delete Book
    const deleteRes = await fetch(`${BASE_URL}/books/${createdBookId}/`, {
      method: 'DELETE'
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200, 'DELETE /books/:bookId/ returns 200 OK');
    assert(deleteData.message === 'Book deleted successfully', 'DELETE returns success message');

    // 15. Verify book is actually removed from database
    const verifyDeleteRes = await fetch(`${BASE_URL}/books/${createdBookId}/`);
    assert(verifyDeleteRes.status === 404, 'GET deleted book returns 404 Not Found (confirmed removed from database)');

    // 16. DELETE /books/:bookId/ - Not Found
    const deleteNotFoundRes = await fetch(`${BASE_URL}/books/99999/`, {
      method: 'DELETE'
    });
    assert(deleteNotFoundRes.status === 404, 'DELETE /books/99999/ returns 404 Not Found');

    // 17. 404 Fallback Route
    const invalidRouteRes = await fetch(`${BASE_URL}/non-existent-route`);
    assert(invalidRouteRes.status === 404, 'Unknown route returns 404 Not Found');

    // 18. Direct Database Verification
    const db = await open({
      filename: path.join(__dirname, 'books.db'),
      driver: sqlite3.Database
    });
    const countRow = await db.get('SELECT COUNT(*) AS count FROM book;');
    await db.close();
    assert(countRow.count === 10, `Direct SQLite check: database contains exactly 10 books after clean test cycle (count: ${countRow.count})`);

    console.log('\n====================================================');
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    if (serverProcess && serverProcess.pid) {
      try {
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
      } catch {}
    }
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
