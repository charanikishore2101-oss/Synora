/**
 * test-api.js
 * -----------
 * Automated test suite for Lab 03: REST API, Query Parameters, Validation, and Debugging.
 * Tests all 16 required assignment test scenarios + edge cases + database verification.
 * Usage: npm test
 */

const { spawn, execSync } = require('child_process');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

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
    console.log('[Test Setup] Starting local Express server on port 3000...');
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

  console.log('\n=============================================================');
  console.log('🧪 Starting Lab 03 Automated REST API & Validation Tests');
  console.log('=============================================================\n');

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
    // 0. Root info route
    const rootRes = await fetch(`${BASE_URL}/`);
    assert(rootRes.status === 200, '0. GET / returns 200 OK');

    // 1. Retrieve all books (GET /books)
    const getAllRes = await fetch(`${BASE_URL}/books`);
    const allBooks = await getAllRes.json();
    assert(getAllRes.status === 200, '1. Retrieve all books (GET /books) returns 200 OK');
    assert(Array.isArray(allBooks), '1.1 GET /books returns an array');
    assert(allBooks.length >= 10, `1.2 GET /books returns all books (got ${allBooks.length})`);

    // 2. Retrieve a book by ID (GET /books/1)
    const getOneRes = await fetch(`${BASE_URL}/books/1`);
    const bookOne = await getOneRes.json();
    assert(getOneRes.status === 200, '2. Retrieve book by ID (GET /books/1) returns 200 OK');
    assert(bookOne.id === 1, `2.1 Returned book ID matches 1 (title: "${bookOne.title}")`);

    // 3. Create a book with valid data (POST /books) -> 201 Created
    const newBookPayload = {
      title: 'Designing Cloud Applications',
      author: 'Jane Doe',
      price: 620,
      pages: 410
    };
    const postRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBookPayload)
    });
    const postData = await postRes.json();
    assert(postRes.status === 201, '3. Create book with valid data (POST /books) returns 201 Created');
    assert(postData.bookId !== undefined, `3.1 Returns newly created bookId: ${postData.bookId}`);
    const createdBookId = postData.bookId;

    // Verify newly inserted book exists in SQLite
    const verifyPostRes = await fetch(`${BASE_URL}/books/${createdBookId}`);
    const verifyPostBook = await verifyPostRes.json();
    assert(verifyPostRes.status === 200, '3.2 GET created book returns 200 OK');
    assert(verifyPostBook.title === newBookPayload.title, '3.3 Created book title verified in database');

    // 4. Update an existing book (PUT /books/:id) -> 200 OK
    const updatePayload = {
      title: 'Designing Cloud Applications (2nd Edition)',
      author: 'Jane Doe',
      price: 680,
      pages: 450
    };
    const putRes = await fetch(`${BASE_URL}/books/${createdBookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    const putData = await putRes.json();
    assert(putRes.status === 200, '4. Update existing book (PUT /books/:id) returns 200 OK');
    assert(putData.message === 'Book updated successfully', '4.1 PUT returns success message');

    // Verify updated book in SQLite
    const verifyPutRes = await fetch(`${BASE_URL}/books/${createdBookId}`);
    const verifyPutBook = await verifyPutRes.json();
    assert(verifyPutBook.title === updatePayload.title, '4.2 Updated book title verified in SQLite');
    assert(verifyPutBook.price === 680, '4.3 Updated book price verified in SQLite');

    // 5. Delete an existing book (DELETE /books/:id) -> 200 OK
    const deleteRes = await fetch(`${BASE_URL}/books/${createdBookId}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200, '5. Delete existing book (DELETE /books/:id) returns 200 OK');
    assert(deleteData.message === 'Book deleted successfully', '5.1 DELETE returns success message');

    // Verify book is removed from SQLite
    const verifyDeleteRes = await fetch(`${BASE_URL}/books/${createdBookId}`);
    assert(verifyDeleteRes.status === 404, '5.2 GET deleted book returns 404 Not Found (confirmed removed from DB)');

    // 6. Search books using search_q (GET /books?search_q=JavaScript)
    const searchRes = await fetch(`${BASE_URL}/books?search_q=JavaScript`);
    const searchBooks = await searchRes.json();
    assert(searchRes.status === 200, '6. Search books using search_q returns 200 OK');
    assert(Array.isArray(searchBooks) && searchBooks.length > 0, `6.1 search_q=JavaScript found ${searchBooks.length} record(s)`);
    assert(searchBooks.every(b => b.title.toLowerCase().includes('javascript')), '6.2 All returned books match search title pattern');

    // 7. Sort books using ASC and DESC (order_by=price&order=ASC and DESC)
    const sortAscRes = await fetch(`${BASE_URL}/books?order_by=price&order=ASC`);
    const sortAscBooks = await sortAscRes.json();
    assert(sortAscRes.status === 200, '7.1 Sort books by price ASC returns 200 OK');
    assert(sortAscBooks[0].price <= sortAscBooks[sortAscBooks.length - 1].price, '7.2 Lowest price book appears first in ASC sort');

    const sortDescRes = await fetch(`${BASE_URL}/books?order_by=price&order=DESC`);
    const sortDescBooks = await sortDescRes.json();
    assert(sortDescRes.status === 200, '7.3 Sort books by price DESC returns 200 OK');
    assert(sortDescBooks[0].price >= sortDescBooks[sortDescBooks.length - 1].price, '7.4 Highest price book appears first in DESC sort');

    // 8. Test limit and offset (pagination)
    const limitRes = await fetch(`${BASE_URL}/books?limit=4&offset=0`);
    const limitBooks = await limitRes.json();
    assert(limitRes.status === 200, '8.1 Pagination limit=4 returns 200 OK');
    assert(limitBooks.length === 4, `8.2 Exactly 4 books returned for limit=4 (got ${limitBooks.length})`);

    const offsetRes = await fetch(`${BASE_URL}/books?limit=4&offset=4`);
    const offsetBooks = await offsetRes.json();
    assert(offsetRes.status === 200, '8.3 Pagination limit=4&offset=4 returns 200 OK');
    assert(offsetBooks[0].id !== limitBooks[0].id, '8.4 Page 2 first record is different from Page 1 first record');

    // 9. Test minimum and maximum price filters (min_price and max_price)
    const priceFilterRes = await fetch(`${BASE_URL}/books?min_price=400&max_price=700`);
    const priceFilterBooks = await priceFilterRes.json();
    assert(priceFilterRes.status === 200, '9.1 Filter min_price=400&max_price=700 returns 200 OK');
    assert(priceFilterBooks.every(b => b.price >= 400 && b.price <= 700), '9.2 All returned books are strictly within [400, 700] INR');

    // 10. Create a book with missing title -> 400 Bad Request
    const missingTitleRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'Author', price: 400 })
    });
    const missingTitleData = await missingTitleRes.json();
    assert(missingTitleRes.status === 400, '10. Create book with missing title returns 400 Bad Request');
    assert(missingTitleData.message === 'Title is required', `10.1 Error message matches: "${missingTitleData.message}"`);

    // 11. Create a book with missing author -> 400 Bad Request
    const missingAuthorRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Some Title', price: 400 })
    });
    const missingAuthorData = await missingAuthorRes.json();
    assert(missingAuthorRes.status === 400, '11. Create book with missing author returns 400 Bad Request');
    assert(missingAuthorData.message === 'Author is required', `11.1 Error message matches: "${missingAuthorData.message}"`);

    // 12. Create a book with non-numeric price -> 400 Bad Request
    const nonNumericPriceRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Book', author: 'Author', price: 'expensive' })
    });
    const nonNumericPriceData = await nonNumericPriceRes.json();
    assert(nonNumericPriceRes.status === 400, '12. Create book with non-numeric price returns 400 Bad Request');
    assert(nonNumericPriceData.message === 'Price must be a number', `12.1 Error message matches: "${nonNumericPriceData.message}"`);

    // Create a book with negative price -> 400 Bad Request
    const negativePriceRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Book', author: 'Author', price: -50 })
    });
    const negativePriceData = await negativePriceRes.json();
    assert(negativePriceRes.status === 400, '12.2 Create book with negative price returns 400 Bad Request');
    assert(negativePriceData.message === 'Price must be a positive number', `12.3 Error message matches: "${negativePriceData.message}"`);

    // 13. Retrieve a non-existing book ID -> 404 Not Found
    const getNotFoundRes = await fetch(`${BASE_URL}/books/99999`);
    const getNotFoundData = await getNotFoundRes.json();
    assert(getNotFoundRes.status === 404, '13. Retrieve non-existing book ID returns 404 Not Found');
    assert(getNotFoundData.message === 'Book not found', `13.1 Returns standardized 404 message: "${getNotFoundData.message}"`);

    // 14. Update a non-existing book ID -> 404 Not Found
    const putNotFoundRes = await fetch(`${BASE_URL}/books/99999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Title', author: 'Author', price: 500 })
    });
    const putNotFoundData = await putNotFoundRes.json();
    assert(putNotFoundRes.status === 404, '14. Update non-existing book ID returns 404 Not Found');
    assert(putNotFoundData.message === 'Book not found', `14.1 Returns standardized 404 message: "${putNotFoundData.message}"`);

    // 15. Delete a non-existing book ID -> 404 Not Found
    const deleteNotFoundRes = await fetch(`${BASE_URL}/books/99999`, {
      method: 'DELETE'
    });
    const deleteNotFoundData = await deleteNotFoundRes.json();
    assert(deleteNotFoundRes.status === 404, '15. Delete non-existing book ID returns 404 Not Found');
    assert(deleteNotFoundData.message === 'Book not found', `15.1 Returns standardized 404 message: "${deleteNotFoundData.message}"`);

    // 16. Test invalid query parameters -> 400 Bad Request
    // 16.1 Invalid order_by column
    const badOrderByRes = await fetch(`${BASE_URL}/books?order_by=hacked_col`);
    const badOrderByData = await badOrderByRes.json();
    assert(badOrderByRes.status === 400, '16.1 Invalid order_by column returns 400 Bad Request');
    assert(badOrderByData.message.includes("Invalid 'order_by' parameter"), '16.1b Expected message for invalid order_by');

    // 16.2 Invalid order direction
    const badOrderDirRes = await fetch(`${BASE_URL}/books?order=SIDEWAYS`);
    const badOrderDirData = await badOrderDirRes.json();
    assert(badOrderDirRes.status === 400, '16.2 Invalid order direction returns 400 Bad Request');
    assert(badOrderDirData.message.includes("Invalid 'order' parameter"), '16.2b Expected message for invalid order direction');

    // 16.3 Invalid negative limit
    const badLimitRes = await fetch(`${BASE_URL}/books?limit=-5`);
    assert(badLimitRes.status === 400, '16.3 Negative limit returns 400 Bad Request');

    // 16.4 Invalid negative offset
    const badOffsetRes = await fetch(`${BASE_URL}/books?offset=-2`);
    assert(badOffsetRes.status === 400, '16.4 Negative offset returns 400 Bad Request');

    // 16.5 min_price > max_price
    const crossPriceRes = await fetch(`${BASE_URL}/books?min_price=900&max_price=200`);
    const crossPriceData = await crossPriceRes.json();
    assert(crossPriceRes.status === 400, '16.5 min_price > max_price returns 400 Bad Request');
    assert(crossPriceData.message === "'min_price' cannot be greater than 'max_price'", '16.5b Cross-price validation error verified');

    // 16.6 Invalid non-integer book ID parameter
    const badIdRes = await fetch(`${BASE_URL}/books/abc`);
    assert(badIdRes.status === 400, '16.6 Invalid bookId parameter (GET /books/abc) returns 400 Bad Request');

    // 17. Combined complex query parameter test
    const combinedRes = await fetch(`${BASE_URL}/books?search_q=a&min_price=300&max_price=850&order_by=price&order=DESC&limit=3&offset=0`);
    const combinedData = await combinedRes.json();
    assert(combinedRes.status === 200, '17. Combined Search + Filter + Sort + Pagination returns 200 OK');
    assert(combinedData.length <= 3, `17.1 Respects limit 3 (got ${combinedData.length})`);

    // 18. Direct SQLite check (confirm clean 10 initial records)
    const db = await open({
      filename: path.join(__dirname, 'books.db'),
      driver: sqlite3.Database
    });
    const rowCount = await db.get('SELECT COUNT(*) AS count FROM book;');
    await db.close();
    assert(rowCount.count === 10, `18. Direct SQLite verification: exactly 10 books in database after clean lifecycle test (count: ${rowCount.count})`);

    console.log('\n=============================================================');
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('=============================================================\n');
  } catch (err) {
    console.error('Fatal test execution error:', err);
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
