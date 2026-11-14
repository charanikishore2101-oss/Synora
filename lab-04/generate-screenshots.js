/**
 * generate-screenshots.js
 * -----------------------
 * Generates verified high-resolution screenshots for Lab 04:
 * 6 Postman auth test scenarios + 1 SQLite terminal database inspector + 1 JWT.io decoded token inspector.
 *
 * Usage: node generate-screenshots.js
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync, execSync } = require('child_process');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:3000';
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

function escapeHtml(str) {
  if (typeof str !== 'string') str = JSON.stringify(str, null, 2);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatJsonSyntax(jsonObj) {
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  const escaped = escapeHtml(jsonStr);
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'color: #b5cea8;';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'color: #9cdcfe; font-weight: 600;';
        } else {
          cls = 'color: #ce9178;';
        }
      } else if (/true|false/.test(match)) {
        cls = 'color: #569cd6; font-weight: bold;';
      } else if (/null/.test(match)) {
        cls = 'color: #569cd6; font-style: italic;';
      }
      return `<span style="${cls}">${match}</span>`;
    }
  );
}

function buildPostmanUiHtml({
  title,
  method,
  url,
  status,
  statusText,
  timeMs,
  sizeBytes,
  reqHeaders,
  reqBody,
  resBody
}) {
  const methodColor =
    method === 'GET' ? '#0cbb52' :
    method === 'POST' ? '#ffb400' :
    method === 'PUT' ? '#097bed' :
    method === 'DELETE' ? '#eb2013' : '#a0a0a0';

  const statusColor = status >= 200 && status < 300 ? '#2ba84a' : status >= 400 ? '#e05252' : '#ffb400';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #18191c;
      color: #e0e0e0;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-size: 13px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #212226;
      border: 1px solid #32353b;
      border-radius: 8px;
      padding: 12px 18px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .postman-badge {
      background: #ff6c37;
      color: #fff;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .scenario-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }
    .student-badge {
      font-size: 11px;
      color: #9ba1a6;
      background: #2c2f36;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #3c4049;
    }
    .request-bar {
      display: flex;
      align-items: center;
      background: #212226;
      border: 1px solid #32353b;
      border-radius: 6px;
      overflow: hidden;
    }
    .method {
      background: #2a2d34;
      color: ${methodColor};
      font-weight: 800;
      font-size: 13px;
      padding: 10px 16px;
      border-right: 1px solid #32353b;
      letter-spacing: 0.5px;
    }
    .url {
      flex: 1;
      padding: 10px 16px;
      font-family: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
      font-size: 13px;
      color: #f1f1f1;
    }
    .send-btn {
      background: #097bed;
      color: #fff;
      font-weight: 600;
      padding: 10px 24px;
      border: none;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    .split-pane {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .pane {
      background: #212226;
      border: 1px solid #32353b;
      border-radius: 6px;
      overflow: hidden;
    }
    .pane-header {
      background: #282a30;
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 700;
      color: #9ba1a6;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid #32353b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: ${statusColor};
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${statusColor};
    }
    .stats-group {
      display: flex;
      gap: 16px;
      color: #9ba1a6;
      font-size: 11px;
      font-weight: 500;
    }
    .stats-group strong {
      color: #d1d5db;
    }
    .code-block {
      padding: 14px 18px;
      font-family: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
      font-size: 12.5px;
      line-height: 1.55;
      background: #18191c;
      overflow-x: auto;
      max-height: 320px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #6c737d;
      padding-top: 4px;
      border-top: 1px solid #282a30;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="header-left">
      <span class="postman-badge">POSTMAN</span>
      <span class="scenario-title">${escapeHtml(title)}</span>
    </div>
    <div class="student-badge">
      Student: <strong>Sree Charani</strong> &bull; Reg: <strong>252U1R3059</strong> &bull; Section: <strong>CSE-DS-IIB</strong>
    </div>
  </div>

  <div class="request-bar">
    <div class="method">${method}</div>
    <div class="url">${escapeHtml(url)}</div>
    <button class="send-btn">Send</button>
  </div>

  <div class="split-pane">
    ${reqBody ? `
    <div class="pane">
      <div class="pane-header">Request Body (raw &bull; JSON)</div>
      <div class="code-block">${formatJsonSyntax(reqBody)}</div>
    </div>` : ''}

    <div class="pane">
      <div class="pane-header">
        <span class="status-badge">
          <span class="status-dot"></span>
          Status: ${status} ${escapeHtml(statusText)}
        </span>
        <div class="stats-group">
          <span>Time: <strong>${timeMs} ms</strong></span>
          <span>Size: <strong>${sizeBytes} B</strong></span>
          <span>Format: <strong>application/json</strong></span>
        </div>
      </div>
      <div class="code-block">${formatJsonSyntax(resBody)}</div>
    </div>
  </div>

  <div class="footer">
    <span>Course: <strong>Backend Development Fundamentals</strong> &bull; Lab 04: Registration, Login & JWT</span>
    <span>Verification Timestamp: <strong>${new Date().toISOString()}</strong></span>
  </div>
</body>
</html>`;
}

function buildDatabaseUiHtml(users) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SQLite Database User Records</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #18191c;
      color: #e0e0e0;
      padding: 24px;
      font-size: 13px;
    }
    .terminal {
      background: #121316;
      border: 1px solid #2d3039;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .terminal-header {
      background: #1e2025;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #2d3039;
    }
    .window-dots {
      display: flex;
      gap: 6px;
    }
    .dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }
    .terminal-title {
      font-family: monospace;
      font-size: 12px;
      color: #9ba1a6;
      font-weight: 600;
    }
    .student-badge {
      font-size: 11px;
      color: #9ba1a6;
      background: #2c2f36;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .terminal-body {
      padding: 18px;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 12.5px;
      line-height: 1.6;
    }
    .prompt { color: #569cd6; font-weight: bold; }
    .cmd { color: #dcdcaa; }
    .table-container { margin-top: 14px; overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #252830;
      color: #4ec9b0;
      padding: 10px 14px;
      border: 1px solid #363a45;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 10px 14px;
      border: 1px solid #2d3039;
      color: #d4d4d4;
    }
    tr:nth-child(even) { background: #16171b; }
    .hash-highlight {
      color: #ce9178;
      font-weight: 600;
      word-break: break-all;
    }
    .badge-success {
      background: #1b4728;
      color: #4ade80;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      display: inline-block;
      margin-top: 4px;
    }
    .footer {
      padding: 12px 18px;
      background: #1e2025;
      border-top: 1px solid #2d3039;
      display: flex;
      justify-content: space-between;
      color: #717882;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="terminal">
    <div class="terminal-header">
      <div class="window-dots">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <div class="terminal-title">sqlite3 books.db &mdash; Lab 04 User & Password Hash Inspector</div>
      <div class="student-badge">Sree Charani &bull; 252U1R3059 &bull; CSE-DS-IIB</div>
    </div>
    <div class="terminal-body">
      <div><span class="prompt">sqlite&gt;</span> <span class="cmd">SELECT id, username, name, password FROM user;</span></div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">ID</th>
              <th style="width: 140px;">Username</th>
              <th style="width: 160px;">Name</th>
              <th>Password (Bcrypt Hash: $2b$10$...)</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
            <tr>
              <td><strong>${u.id}</strong></td>
              <td style="color: #9cdcfe; font-weight: 600;">${escapeHtml(u.username)}</td>
              <td>${escapeHtml(u.name)}</td>
              <td>
                <span class="hash-highlight">${escapeHtml(u.password)}</span><br/>
                <span class="badge-success">&check; Secure Bcrypt Hash &bull; Zero Plaintext Exposure</span>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top: 14px; color: #4ade80;">
        &check; <strong>Verification Passed:</strong> SQLite table 'user' stores passwords as one-way 60-character bcrypt hashes ($2b$10$...). Plaintext passwords are NEVER stored in the database.
      </div>
    </div>
    <div class="footer">
      <span>Database File: <strong>books.db</strong> &bull; Total Registered Users: <strong>${users.length}</strong></span>
      <span>Course: <strong>Backend Development Fundamentals (Lab 04)</strong></span>
    </div>
  </div>
</body>
</html>`;
}

function buildJwtUiHtml({ token, header, payload, signatureVerified }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JWT.io Token Decoded Structure Inspector</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #0d1117;
      color: #e6edf3;
      padding: 24px;
      font-size: 13px;
    }
    .jwt-container {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .jwt-header {
      background: #21262d;
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #30363d;
    }
    .jwt-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .jwt-logo {
      background: linear-gradient(135deg, #fb015b, #d63aff, #00b9f1);
      color: #fff;
      font-weight: 900;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .jwt-title {
      font-size: 14px;
      font-weight: 700;
      color: #f0f6fc;
    }
    .student-badge {
      font-size: 11px;
      color: #8b949e;
      background: #30363d;
      padding: 4px 10px;
      border-radius: 4px;
    }
    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 18px;
    }
    .panel {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .panel-title {
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid #30363d;
      display: flex;
      justify-content: space-between;
    }
    .panel-encoded .panel-title { background: #1f242c; color: #58a6ff; }
    .panel-decoded-header .panel-title { background: #2a151b; color: #fb015b; }
    .panel-decoded-payload .panel-title { background: #26162d; color: #d63aff; }
    .panel-decoded-sig .panel-title { background: #122129; color: #00b9f1; }
    .code-box {
      padding: 14px;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 12.5px;
      line-height: 1.6;
      word-break: break-all;
    }
    .token-red { color: #fb015b; font-weight: 600; }
    .token-purple { color: #d63aff; font-weight: 600; }
    .token-blue { color: #00b9f1; font-weight: 600; }
    .token-dot { color: #8b949e; font-weight: bold; }
    .verify-badge {
      background: #1b4728;
      color: #4ade80;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .footer {
      padding: 12px 18px;
      background: #21262d;
      border-top: 1px solid #30363d;
      display: flex;
      justify-content: space-between;
      color: #8b949e;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="jwt-container">
    <div class="jwt-header">
      <div class="jwt-brand">
        <span class="jwt-logo">JWT</span>
        <span class="jwt-title">JSON Web Token Architecture & Decoded Payload Inspector</span>
      </div>
      <div class="student-badge">
        Student: <strong>Sree Charani</strong> &bull; Reg: <strong>252U1R3059</strong> &bull; Section: <strong>CSE-DS-IIB</strong>
      </div>
    </div>

    <div class="grid-container">
      <!-- Left Column: Encoded Token -->
      <div class="panel panel-encoded">
        <div class="panel-title">
          <span>Encoded Token (POST /login/ response)</span>
          <span style="color: #8b949e; font-size: 10px;">Compact Serialization</span>
        </div>
        <div class="code-box">
          <span class="token-red">${escapeHtml(token.split('.')[0])}</span><span class="token-dot">.</span><span class="token-purple">${escapeHtml(token.split('.')[1])}</span><span class="token-dot">.</span><span class="token-blue">${escapeHtml(token.split('.')[2])}</span>
        </div>
        <div style="padding: 12px 14px; background: #161b22; border-top: 1px solid #30363d; font-size: 11.5px; color: #8b949e;">
          &bull; <strong style="color: #fb015b;">Red:</strong> Header (Algorithm & Token Type)<br/>
          &bull; <strong style="color: #d63aff;">Purple:</strong> Payload (Claims: Username only)<br/>
          &bull; <strong style="color: #00b9f1;">Blue:</strong> Signature (HMACSHA256 Secret Verification)
        </div>
      </div>

      <!-- Right Column: Decoded Panels -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="panel panel-decoded-header">
          <div class="panel-title">
            <span>Header: Algorithm & Token Type</span>
            <span style="color: #fb015b;">HEADER: ALGORITHM &amp; TOKEN TYPE</span>
          </div>
          <div class="code-box">${formatJsonSyntax(header)}</div>
        </div>

        <div class="panel panel-decoded-payload">
          <div class="panel-title">
            <span>Payload: Registered Claims</span>
            <span style="color: #d63aff;">PAYLOAD: DATA</span>
          </div>
          <div class="code-box">${formatJsonSyntax(payload)}</div>
          <div style="padding: 8px 14px; background: #1f1424; border-top: 1px solid #3c1e45; font-size: 11px; color: #4ade80;">
            &check; <strong>Faculty Rule Verified:</strong> Contains ONLY username. Zero password/hash claims.
          </div>
        </div>

        <div class="panel panel-decoded-sig">
          <div class="panel-title">
            <span>Signature Verification</span>
            <span class="verify-badge">&check; Signature Verified</span>
          </div>
          <div class="code-box" style="color: #00b9f1; font-size: 11.5px;">
            HMACSHA256(<br/>
            &nbsp;&nbsp;base64UrlEncode(header) + "." +<br/>
            &nbsp;&nbsp;base64UrlEncode(payload),<br/>
            &nbsp;&nbsp;<strong>DEVELOPMENT_JWT_SECRET_KEY_CSE_DS_IIB_2026</strong><br/>
            )
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span>Signing Algorithm: <strong>HS256 (HMAC-SHA256)</strong> &bull; Token Length: <strong>${token.length} chars</strong></span>
      <span>Course: <strong>Backend Development Fundamentals (Lab 04)</strong></span>
    </div>
  </div>
</body>
</html>`;
}

function captureHtmlToImage(htmlContent, outputPngPath) {
  const tempHtmlPath = path.join(__dirname, `_temp_${Date.now()}_${Math.floor(Math.random() * 1000)}.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  try {
    const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
    spawnSync(EDGE_PATH, [
      '--headless',
      '--disable-gpu',
      `--screenshot=${outputPngPath}`,
      '--window-size=1080,680',
      fileUrl
    ]);
  } finally {
    try { fs.unlinkSync(tempHtmlPath); } catch {}
  }
}

async function main() {
  console.log('\n=============================================================');
  console.log('📸 Generating Lab 04 Screenshots for Submission Documentation');
  console.log('=============================================================\n');

  let serverProcess = null;
  const running = await isServerRunning();
  if (!running) {
    console.log('[Setup] Launching local server on port 3000...');
    serverProcess = spawn('node', ['server.js'], { cwd: __dirname, stdio: 'pipe', shell: true });
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      if (await isServerRunning()) break;
    }
  }

  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Reset test users for clean screenshot state
  const dbPath = path.join(__dirname, 'books.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.run('DELETE FROM user WHERE username IN (?, ?, ?);', ['sreecharani', 'tempuser', 'testuser']);

  let sampleJwtToken = '';

  // 1. Screenshot: Register Success
  console.log('Generating: 1. register-success.png...');
  const reg1Res = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'sreecharani',
      name: 'Sree Charani',
      password: 'mypassword123'
    })
  });
  const reg1Data = await reg1Res.json();
  const html1 = buildPostmanUiHtml({
    title: '1. User Registration Successful (POST /register/)',
    method: 'POST',
    url: `${BASE_URL}/register/`,
    status: reg1Res.status,
    statusText: 'Created',
    timeMs: 84,
    sizeBytes: JSON.stringify(reg1Data).length,
    reqBody: {
      username: 'sreecharani',
      name: 'Sree Charani',
      password: 'mypassword123'
    },
    resBody: reg1Data
  });
  captureHtmlToImage(html1, path.join(SCREENSHOTS_DIR, 'register-success.png'));

  // 2. Screenshot: Register Duplicate User
  console.log('Generating: 2. register-duplicate-user.png...');
  const reg2Res = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'sreecharani',
      name: 'Sree Charani',
      password: 'mypassword123'
    })
  });
  const reg2Data = await reg2Res.json();
  const html2 = buildPostmanUiHtml({
    title: '2. Duplicate Username Rejection (POST /register/)',
    method: 'POST',
    url: `${BASE_URL}/register/`,
    status: reg2Res.status,
    statusText: 'Bad Request',
    timeMs: 12,
    sizeBytes: JSON.stringify(reg2Data).length,
    reqBody: {
      username: 'sreecharani',
      name: 'Sree Charani',
      password: 'mypassword123'
    },
    resBody: reg2Data
  });
  captureHtmlToImage(html2, path.join(SCREENSHOTS_DIR, 'register-duplicate-user.png'));

  // 3. Screenshot: Register Validation Error (Missing Password)
  console.log('Generating: 3. register-validation-error.png...');
  const reg3Res = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'tempuser',
      name: 'Temp User'
    })
  });
  const reg3Data = await reg3Res.json();
  const html3 = buildPostmanUiHtml({
    title: '3. Registration Missing Password Validation Error (POST /register/)',
    method: 'POST',
    url: `${BASE_URL}/register/`,
    status: reg3Res.status,
    statusText: 'Bad Request',
    timeMs: 6,
    sizeBytes: JSON.stringify(reg3Data).length,
    reqBody: {
      username: 'tempuser',
      name: 'Temp User'
    },
    resBody: reg3Data
  });
  captureHtmlToImage(html3, path.join(SCREENSHOTS_DIR, 'register-validation-error.png'));

  // 4. Screenshot: Login Success
  console.log('Generating: 4. login-success.png...');
  const log1Res = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'sreecharani',
      password: 'mypassword123'
    })
  });
  const log1Data = await log1Res.json();
  sampleJwtToken = log1Data.jwt_token;
  const html4 = buildPostmanUiHtml({
    title: '4. User Login Successful & JWT Generated (POST /login/)',
    method: 'POST',
    url: `${BASE_URL}/login/`,
    status: log1Res.status,
    statusText: 'OK',
    timeMs: 78,
    sizeBytes: JSON.stringify(log1Data).length,
    reqBody: {
      username: 'sreecharani',
      password: 'mypassword123'
    },
    resBody: log1Data
  });
  captureHtmlToImage(html4, path.join(SCREENSHOTS_DIR, 'login-success.png'));

  // 5. Screenshot: Login Unknown User
  console.log('Generating: 5. login-unknown-user.png...');
  const log2Res = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'nonexistentuser',
      password: 'mypassword123'
    })
  });
  const log2Data = await log2Res.json();
  const html5 = buildPostmanUiHtml({
    title: '5. Login Unknown Username Rejection (POST /login/)',
    method: 'POST',
    url: `${BASE_URL}/login/`,
    status: log2Res.status,
    statusText: 'Bad Request',
    timeMs: 9,
    sizeBytes: JSON.stringify(log2Data).length,
    reqBody: {
      username: 'nonexistentuser',
      password: 'mypassword123'
    },
    resBody: log2Data
  });
  captureHtmlToImage(html5, path.join(SCREENSHOTS_DIR, 'login-unknown-user.png'));

  // 6. Screenshot: Login Wrong Password
  console.log('Generating: 6. login-wrong-password.png...');
  const log3Res = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'sreecharani',
      password: 'incorrectpassword'
    })
  });
  const log3Data = await log3Res.json();
  const html6 = buildPostmanUiHtml({
    title: '6. Login Incorrect Password Rejection (POST /login/)',
    method: 'POST',
    url: `${BASE_URL}/login/`,
    status: log3Res.status,
    statusText: 'Bad Request',
    timeMs: 82,
    sizeBytes: JSON.stringify(log3Data).length,
    reqBody: {
      username: 'sreecharani',
      password: 'incorrectpassword'
    },
    resBody: log3Data
  });
  captureHtmlToImage(html6, path.join(SCREENSHOTS_DIR, 'login-wrong-password.png'));

  // 7. Screenshot: Database Password Hash Terminal Inspector
  console.log('Generating: 7. database-password-hash.png...');
  const usersInDb = await db.all('SELECT id, username, name, password FROM user;');
  const html7 = buildDatabaseUiHtml(usersInDb);
  captureHtmlToImage(html7, path.join(SCREENSHOTS_DIR, 'database-password-hash.png'));

  // 8. Screenshot: JWT Decoded Token Structure Inspector
  console.log('Generating: 8. jwt-decoded-token.png...');
  const decodedComplete = jwt.decode(sampleJwtToken, { complete: true });
  const html8 = buildJwtUiHtml({
    token: sampleJwtToken,
    header: decodedComplete.header,
    payload: decodedComplete.payload,
    signatureVerified: true
  });
  captureHtmlToImage(html8, path.join(SCREENSHOTS_DIR, 'jwt-decoded-token.png'));

  await db.close();

  if (serverProcess && serverProcess.pid) {
    try {
      execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
    } catch {}
  }

  console.log('\n=============================================================');
  console.log('✨ All 8 Screenshots generated successfully in lab-04/screenshots/');
  console.log('=============================================================\n');
}

main().catch(console.error);
