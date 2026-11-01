/**
 * server.js
 * ---------
 * Express server with four routes for Lab 01.
 *
 * Lab 01 - Node.js and Express Server
 * Student : Sree Charani | Reg: 252U1R3059 | Sec: CSE-DS-2B
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Import Express.
//    Express is a third-party framework that makes building web servers
//    in Node.js much easier than using the built-in 'http' module alone.
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');

// ─────────────────────────────────────────────────────────────────────────────
// 2. Initialise the Express application.
//    'app' is the central object. All routes and middleware are attached to it.
// ─────────────────────────────────────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// 3. Define the port.
//    process.env.PORT is used by hosting platforms (like Render).
//    If that variable is not set (local development), fall back to 3000.
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 1: GET /
// Returns a plain-text welcome message with HTTP status 200.
// ─────────────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  // res.status(200) sets the HTTP status code.
  // .send() sends the response body back to the client.
  res.status(200).send('Welcome to Node.js and Express Server!');
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 2: GET /about
// Returns a JSON object with student / section information.
// res.json() automatically sets Content-Type to application/json.
// ─────────────────────────────────────────────────────────────────────────────
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'Reddy Mahitha',
    section: 'CSE-DS-2B'
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 3: GET /time
// Returns the current server date and time as JSON.
// new Date() creates a Date object for the current moment.
// ─────────────────────────────────────────────────────────────────────────────
app.get('/time', (req, res) => {
  const currentTime = new Date();

  res.status(200).json({
    currentDateTime: currentTime.toString(),       // Human-readable string
    isoFormat: currentTime.toISOString(),          // ISO 8601 format
    timestamp: currentTime.getTime()               // Milliseconds since epoch
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 4: 404 Catch-All Middleware
// IMPORTANT: This MUST be placed AFTER all other routes.
// Express processes routes in order, so this only runs when nothing else matched.
// app.use() with no path matches every URL.
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Start the server.
//    app.listen() binds the server to the given port and starts listening
//    for incoming HTTP requests.
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser.`);
  console.log('Press Ctrl+C to stop the server.');
});
