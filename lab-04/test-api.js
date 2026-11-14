/**
 * test-api.js
 * -----------
 * Automated test suite for Lab 04: Registration, Login and JWT Authentication.
 * Tests all required registration, login, JWT structure, and database validation scenarios.
 * Usage: npm test
 */

const { spawn, execSync } = require('child_process');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const JWT_SECRET = 'DEVELOPMENT_JWT_SECRET_KEY_CSE_DS_IIB_2026';

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
      process.exit(1);
    }
  }

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
    console.log('\n=============================================================');
    console.log('🧪 Starting Lab 04 Automated Auth, Registration & JWT Tests');
    console.log('=============================================================\n');

    // Clean up test users from DB before running tests
    const dbPath = path.join(__dirname, 'books.db');
    const initDb = await open({ filename: dbPath, driver: sqlite3.Database });
    await initDb.run('DELETE FROM user WHERE username IN (?, ?, ?);', ['sreecharani', 'testuser2', 'tempuser']);
    await initDb.close();

    // 0. Root info route
    const rootRes = await fetch(`${BASE_URL}/`);
    assert(rootRes.status === 200, '0. GET / returns 200 OK with server info');

    // -------------------------------------------------------------------------
    // REGISTRATION TESTS
    // -------------------------------------------------------------------------
    console.log('\n--- Part 1: Registration API (POST /register/) ---');

    // Test 1: Successful Registration
    const regPayload = {
      username: 'sreecharani',
      name: 'Sree Charani',
      password: 'mypassword123'
    };
    const regRes = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload)
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Test 1.1: Successful registration returns 201 Created');
    assert(regData.message === 'User created successfully', 'Test 1.2: Response message is "User created successfully"');
    assert(regData.password === undefined && regData.hash === undefined, 'Test 1.3: Response never exposes password or hash');

    // Test 2: Duplicate Username Registration
    const dupRes = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload)
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 400, 'Test 2.1: Duplicate username registration returns 400 Bad Request');
    assert(dupData.message === 'User already exists', 'Test 2.2: Duplicate error message is "User already exists"');

    // Test 3: Missing Username
    const missingUsernameRes = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sree Charani', password: 'mypassword123' })
    });
    const missingUsernameData = await missingUsernameRes.json();
    assert(missingUsernameRes.status === 400, 'Test 3.1: Missing username returns 400 Bad Request');
    assert(missingUsernameData.message === 'Username is required', 'Test 3.2: Error message is "Username is required"');

    // Test 4: Missing Name
    const missingNameRes = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'tempuser', password: 'mypassword123' })
    });
    const missingNameData = await missingNameRes.json();
    assert(missingNameRes.status === 400, 'Test 4.1: Missing name returns 400 Bad Request');
    assert(missingNameData.message === 'Name is required', 'Test 4.2: Error message is "Name is required"');

    // Test 5: Missing Password
    const missingPassRes = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'tempuser', name: 'Temp User' })
    });
    const missingPassData = await missingPassRes.json();
    assert(missingPassRes.status === 400, 'Test 5.1: Missing password returns 400 Bad Request');
    assert(missingPassData.message === 'Password is required', 'Test 5.2: Error message is "Password is required"');

    // -------------------------------------------------------------------------
    // LOGIN TESTS
    // -------------------------------------------------------------------------
    console.log('\n--- Part 2: Login API (POST /login/) ---');

    // Test 6: Successful Login
    const loginPayload = {
      username: 'sreecharani',
      password: 'mypassword123'
    };
    const loginRes = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Test 6.1: Successful login returns 200 OK');
    assert(loginData.jwt_token !== undefined && typeof loginData.jwt_token === 'string', 'Test 6.2: Response contains "jwt_token"');
    const returnedToken = loginData.jwt_token;

    // Test 7: Unknown Username
    const unknownUserRes = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'nonexistentuser', password: 'mypassword123' })
    });
    const unknownUserData = await unknownUserRes.json();
    assert(unknownUserRes.status === 400, 'Test 7.1: Unknown username returns 400 Bad Request');
    assert(unknownUserData.message === 'Invalid user', 'Test 7.2: Error message is "Invalid user"');
    assert(unknownUserData.jwt_token === undefined, 'Test 7.3: No JWT token generated for unknown user');

    // Test 8: Incorrect Password
    const wrongPassRes = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sreecharani', password: 'wrongpassword' })
    });
    const wrongPassData = await wrongPassRes.json();
    assert(wrongPassRes.status === 400, 'Test 8.1: Incorrect password returns 400 Bad Request');
    assert(wrongPassData.message === 'Invalid password', 'Test 8.2: Error message is "Invalid password"');
    assert(wrongPassData.jwt_token === undefined, 'Test 8.3: No JWT token generated for incorrect password');

    // Test 9: Missing Credentials
    const missingCredsRes = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sreecharani' })
    });
    const missingCredsData = await missingCredsRes.json();
    assert(missingCredsRes.status === 400, 'Test 9.1: Missing password in login returns 400 Bad Request');
    assert(missingCredsData.message === 'Password is required', 'Test 9.2: Returns appropriate validation message');

    const missingCredsUserRes = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'mypassword123' })
    });
    assert(missingCredsUserRes.status === 400, 'Test 9.3: Missing username in login returns 400 Bad Request');

    // -------------------------------------------------------------------------
    // JWT DECODING & STRUCTURE VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- Part 3: JWT Structure & Security Verification ---');

    const decoded = jwt.decode(returnedToken, { complete: true });
    assert(decoded !== null, 'Test 10.1: JWT successfully decoded');
    assert(decoded.header && decoded.header.alg === 'HS256', 'Test 10.2: JWT Header contains algorithm HS256');
    assert(decoded.header && decoded.header.typ === 'JWT', 'Test 10.3: JWT Header contains type JWT');
    assert(decoded.payload && decoded.payload.username === 'sreecharani', 'Test 10.4: JWT Payload contains username "sreecharani"');
    assert(decoded.payload.password === undefined, 'Test 10.5: JWT Payload does NOT contain password');
    assert(decoded.payload.hash === undefined, 'Test 10.6: JWT Payload does NOT contain password hash');

    // Verify signature using our secret
    let verified = false;
    try {
      jwt.verify(returnedToken, JWT_SECRET);
      verified = true;
    } catch {}
    assert(verified, 'Test 10.7: JWT signature verified successfully using secret key');

    // -------------------------------------------------------------------------
    // DATABASE VERIFICATION (Direct SQLite inspection)
    // -------------------------------------------------------------------------
    console.log('\n--- Part 4: Direct SQLite Database Verification ---');

    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    const userInDb = await db.get('SELECT * FROM user WHERE username = ?;', ['sreecharani']);
    assert(userInDb !== undefined, 'Test 11.1: User record found in SQLite database');
    assert(userInDb.name === 'Sree Charani', 'Test 11.2: User name correctly stored');
    assert(userInDb.password !== 'mypassword123', 'Test 11.3: Plain text password is NOT stored in database');
    assert(userInDb.password.startsWith('$2b$10$'), 'Test 11.4: Password column contains valid bcrypt hash ($2b$10$...)');

    // -------------------------------------------------------------------------
    // PRESERVED LAB 03 ENDPOINTS
    // -------------------------------------------------------------------------
    console.log('\n--- Part 5: Preserved Lab 03 Book Catalog Endpoints ---');

    const booksRes = await fetch(`${BASE_URL}/books?limit=5`);
    const booksData = await booksRes.json();
    if (booksRes.status !== 200) {
      console.log('GET /books debug:', booksRes.status, booksData);
    }
    assert(booksRes.status === 200, 'Test 12.1: GET /books returns 200 OK');
    assert(Array.isArray(booksData) && booksData.length <= 5, 'Test 12.2: GET /books respects limit query param');

    const bookOneRes = await fetch(`${BASE_URL}/books/1`);
    assert(bookOneRes.status === 200, 'Test 12.3: GET /books/1 returns 200 OK');

    await db.close();

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
