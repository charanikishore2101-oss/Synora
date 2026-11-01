/**
 * basic-server.js
 * ---------------
 * Demonstrates how to create a simple HTTP server using
 * Node.js's BUILT-IN 'http' module (no Express needed here).
 *
 * Lab 01 - Node.js and Express Server
 * Student : Sree Charani | Reg: 252U1R3059 | Sec: CSE-DS-2B
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Import the built-in 'http' module.
//    'require' loads a module. Since 'http' is built into Node.js,
//    we don't need to install anything with npm.
// ─────────────────────────────────────────────────────────────────────────────
const http = require('http');

// ─────────────────────────────────────────────────────────────────────────────
// 2. Define the port the server will listen on.
// ─────────────────────────────────────────────────────────────────────────────
const PORT = 3000;

// ─────────────────────────────────────────────────────────────────────────────
// 3. Create the HTTP server.
//    http.createServer() accepts a callback function that is called
//    every time a request arrives.
//    - req  → the incoming request object (URL, method, headers, etc.)
//    - res  → the response object (used to send data back to the browser)
// ─────────────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // Set the HTTP status code to 200 (OK) and set the response
  // content type to plain text so the browser displays it correctly.
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // Send the response body and close the connection.
  res.end('Hello');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Start the server and make it listen on PORT 3000.
//    The callback function runs once the server is ready.
// ─────────────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Basic HTTP server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server.');
});
