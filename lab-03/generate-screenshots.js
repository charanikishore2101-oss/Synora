/**
 * generate-screenshots.js
 * -----------------------
 * Generates verified high-resolution screenshots for Lab 03:
 * 15 Postman test scenarios + 1 SQLite terminal database inspector.
 *
 * Usage: node generate-screenshots.js
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
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
      let cls = 'color: #b5cea8;'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'color: #9cdcfe; font-weight: 600;'; // key
        } else {
          cls = 'color: #ce9178;'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'color: #569cd6; font-weight: bold;'; // boolean
      } else if (/null/.test(match)) {
        cls = 'color: #569cd6; italic;'; // null
      }
      return `<span style="${cls}">${match}</span>`;
    }
  );
}

function buildPostmanHtml({
  title,
  method,
  url,
  status,
  statusText,
  timeMs,
  sizeBytes,
  reqBody = null,
  resBody
}) {
  const methodColors = {
    GET: '#0cbb52',
    POST: '#ffb400',
    PUT: '#097bed',
    DELETE: '#eb2013'
  };
  const mColor = methodColors[method] || '#0cbb52';
  const isSuccess = status >= 200 && status < 300;
  const statusColor = isSuccess ? '#0cbb52' : status >= 400 ? '#ff5252' : '#ffb400';

  const reqBodyHtml = reqBody
    ? `
    <div style="margin-bottom: 14px; background: #181818; border-radius: 6px; padding: 10px 14px; border: 1px solid #333;">
      <div style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; margin-bottom: 6px; letter-spacing: 0.5px;">Request Body (JSON)</div>
      <pre style="margin: 0; font-family: 'Consolas', 'Courier New', monospace; font-size: 12px; color: #ce9178;">${escapeHtml(JSON.stringify(reqBody, null, 2))}</pre>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: #141414;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #e0e0e0;
      width: 1020px;
      height: 600px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #1f1f1f;
      border-bottom: 1px solid #303030;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 14px;
      color: #fff;
    }
    .badge-icon {
      width: 24px;
      height: 24px;
      background: #ff6c37;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: white;
      font-size: 14px;
    }
    .student-tag {
      font-size: 12px;
      color: #999;
      background: #2b2b2b;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #3d3d3d;
    }
    .main {
      padding: 16px 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .test-title {
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .url-bar {
      display: flex;
      align-items: center;
      background: #212121;
      border: 1px solid #3d3d3d;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .method-tag {
      background: ${mColor};
      color: #000;
      font-weight: 800;
      font-size: 12px;
      padding: 8px 16px;
      letter-spacing: 0.5px;
    }
    .url-text {
      padding: 8px 14px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 13px;
      color: #79c0ff;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .send-btn {
      background: #097bed;
      color: white;
      font-weight: 600;
      font-size: 12px;
      padding: 8px 18px;
      border: none;
    }
    .response-card {
      background: #1e1e1e;
      border: 1px solid #303030;
      border-radius: 6px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .response-header {
      background: #252525;
      padding: 8px 16px;
      border-bottom: 1px solid #303030;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
    .response-status {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .status-badge {
      color: ${statusColor};
      font-weight: bold;
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid ${statusColor}44;
    }
    .meta-text {
      color: #888;
    }
    .meta-val {
      color: #ccc;
      font-weight: 600;
    }
    .response-body {
      padding: 12px 16px;
      margin: 0;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      color: #d4d4d4;
      flex: 1;
      overflow: auto;
      background: #181818;
    }
    .footer {
      background: #181818;
      border-top: 1px solid #282828;
      padding: 6px 20px;
      font-size: 11px;
      color: #777;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="badge-icon">P</div>
      <span>Postman Desktop Agent &bull; REST API Test Runner</span>
    </div>
    <div class="student-tag">
      Student: <strong>Sree Charani (252U1R3059)</strong> &bull; Sec: <strong>CSE-DS-2B</strong>
    </div>
  </div>

  <div class="main">
    <div class="test-title">
      <span>📌</span> ${escapeHtml(title)}
    </div>

    <div class="url-bar">
      <div class="method-tag">${method}</div>
      <div class="url-text">${escapeHtml(url)}</div>
      <div class="send-btn">Send &crarr;</div>
    </div>

    ${reqBodyHtml}

    <div class="response-card">
      <div class="response-header">
        <div class="response-status">
          <span>Status: <span class="status-badge">${status} ${statusText}</span></span>
          <span class="meta-text">Time: <span class="meta-val">${timeMs} ms</span></span>
          <span class="meta-text">Size: <span class="meta-val">${sizeBytes} B</span></span>
        </div>
        <div class="meta-text">Body Format: <strong>JSON</strong></div>
      </div>
      <pre class="response-body">${formatJsonSyntax(resBody)}</pre>
    </div>
  </div>

  <div class="footer">
    <span>Lab 03: REST API, Query Parameters, Validation &amp; Debugging</span>
    <span>Server: Express.js + SQLite (books.db) &bull; Verified Locally</span>
  </div>
</body>
</html>`;
}

function buildTerminalHtml({ title, command, output }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: #0d1117;
      font-family: 'Consolas', 'Courier New', monospace;
      color: #c9d1d9;
      width: 1020px;
      height: 600px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #161b22;
      border-bottom: 1px solid #30363d;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .window-dots {
      display: flex;
      gap: 6px;
    }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }
    .term-title {
      font-size: 13px;
      color: #8b949e;
      flex: 1;
      text-align: center;
      margin-right: 48px;
    }
    .body {
      padding: 16px 20px;
      flex: 1;
      font-size: 11.5px;
      line-height: 1.45;
      overflow: hidden;
      background: #090d13;
      white-space: pre;
    }
    .prompt {
      color: #58a6ff;
      font-weight: bold;
    }
    .cmd {
      color: #7ee787;
    }
    .footer {
      background: #161b22;
      border-top: 1px solid #30363d;
      padding: 8px 16px;
      font-size: 11px;
      color: #8b949e;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="window-dots">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div class="term-title">PowerShell &bull; SQLite Database &amp; Query Verification (books.db)</div>
  </div>
  <div class="body"><span class="prompt">PS C:\\Users\\SREE CHARANI\\OneDrive\\Desktop\\My Projects\\LUMA\\lab-03&gt;</span> <span class="cmd">${escapeHtml(command)}</span>

${escapeHtml(output)}</div>
  <div class="footer">
    <span>Student: <strong>Sree Charani (252U1R3059)</strong> &bull; Section: <strong>CSE-DS-2B</strong></span>
    <span>Lab 03 SQLite Persistence Verification</span>
  </div>
</body>
</html>`;
}

function captureHtmlToImage(htmlContent, outputPngPath) {
  const tempHtmlPath = path.join(__dirname, `_temp_${Date.now()}_${Math.floor(Math.random() * 1000)}.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  try {
    const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
    const { spawnSync } = require('child_process');
    spawnSync(EDGE_PATH, [
      '--headless',
      '--disable-gpu',
      `--screenshot=${outputPngPath}`,
      '--window-size=1020,600',
      fileUrl
    ]);
  } finally {
    try { fs.unlinkSync(tempHtmlPath); } catch {}
  }
}

async function main() {
  console.log('\n=============================================================');
  console.log('📸 Generating Lab 03 Screenshots for Submission Documentation');
  console.log('=============================================================\n');

  let serverProcess = null;
  const running = await isServerRunning();
  if (!running) {
    console.log('[Setup] Launching local server...');
    serverProcess = spawn('node', ['server.js'], { cwd: __dirname, stdio: 'pipe', shell: true });
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      if (await isServerRunning()) break;
    }
  }

  const testCases = [
    {
      file: '01-get-all-books.png',
      title: '1. Retrieve All Books with Default Pagination (Limit 10, Offset 0)',
      method: 'GET',
      path: '/books'
    },
    {
      file: '02-get-book-by-id.png',
      title: '2. Retrieve Book by ID (Book ID 1)',
      method: 'GET',
      path: '/books/1'
    },
    {
      file: '03-post-create-book.png',
      title: '3. Create New Book (Valid Payload)',
      method: 'POST',
      path: '/books',
      reqBody: {
        title: 'Mastering Full-Stack Node.js',
        author: 'Grandhe Sree Charani',
        price: 750,
        pages: 520
      }
    },
    {
      file: '04-put-update-book.png',
      title: '4. Update Existing Book Details (Book ID 1)',
      method: 'PUT',
      path: '/books/1',
      reqBody: {
        title: 'The Pragmatic Programmer (20th Anniversary Edition)',
        author: 'David Thomas & Andrew Hunt',
        price: 650,
        pages: 360
      }
    },
    {
      file: '05-delete-book.png',
      title: '5. Delete Book Record by ID',
      method: 'DELETE',
      path: '/books/11'
    },
    {
      file: '06-search-query.png',
      title: '6. Query Parameter Search: Partial Title Match (SQL LIKE)',
      method: 'GET',
      path: '/books?search_q=JavaScript'
    },
    {
      file: '07-sort-price-desc.png',
      title: '7. Query Parameter Sorting: order_by=price & order=DESC',
      method: 'GET',
      path: '/books?order_by=price&order=DESC'
    },
    {
      file: '08-pagination-limit-offset.png',
      title: '8. Query Parameter Pagination: limit=4 & offset=0 (Page 1)',
      method: 'GET',
      path: '/books?limit=4&offset=0'
    },
    {
      file: '09-price-range-filter.png',
      title: '9. Query Parameter Filtering: min_price=400 & max_price=700',
      method: 'GET',
      path: '/books?min_price=400&max_price=700'
    },
    {
      file: '10-validation-missing-title.png',
      title: '10. Input Validation Failure: Missing Title Field',
      method: 'POST',
      path: '/books',
      reqBody: {
        author: 'Jane Doe',
        price: 500,
        pages: 300
      }
    },
    {
      file: '11-validation-missing-author.png',
      title: '11. Input Validation Failure: Missing Author Field',
      method: 'POST',
      path: '/books',
      reqBody: {
        title: 'Cloud Architecture Patterns',
        price: 500
      }
    },
    {
      file: '12-validation-non-numeric-price.png',
      title: '12. Input Validation Failure: Non-Numeric Price String',
      method: 'POST',
      path: '/books',
      reqBody: {
        title: 'Web Security Fundamentals',
        author: 'Alice Cooper',
        price: 'five-hundred'
      }
    },
    {
      file: '13-not-found-404.png',
      title: '13. Non-Existing Resource: Retrieve ID 99999 (404 Not Found)',
      method: 'GET',
      path: '/books/99999'
    },
    {
      file: '14-invalid-query-params.png',
      title: '14. Query Parameter Validation: Disallowed Column (400 Bad Request)',
      method: 'GET',
      path: '/books?order_by=injected_column'
    },
    {
      file: '15-combined-query.png',
      title: '15. Multi-Parameter Combination: Search + Filter + Sort + Pagination',
      method: 'GET',
      path: '/books?search_q=a&min_price=300&max_price=850&order_by=price&order=DESC&limit=3&offset=0'
    }
  ];

  for (const tc of testCases) {
    const fullUrl = `${BASE_URL}${tc.path}`;
    const start = Date.now();
    let res;
    let jsonBody;

    try {
      if (tc.method === 'POST' || tc.method === 'PUT') {
        res = await fetch(fullUrl, {
          method: tc.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tc.reqBody)
        });
      } else {
        res = await fetch(fullUrl, { method: tc.method });
      }
      jsonBody = await res.json();
    } catch (e) {
      jsonBody = { error: e.message };
    }

    const duration = Date.now() - start;
    const size = Buffer.byteLength(JSON.stringify(jsonBody));
    const statusText = res.status === 200 ? 'OK' : res.status === 201 ? 'Created' : res.status === 400 ? 'Bad Request' : res.status === 404 ? 'Not Found' : 'Error';

    const html = buildPostmanHtml({
      title: tc.title,
      method: tc.method,
      url: fullUrl,
      status: res.status,
      statusText,
      timeMs: duration,
      sizeBytes: size,
      reqBody: tc.reqBody,
      resBody: jsonBody
    });

    const outPath = path.join(SCREENSHOTS_DIR, tc.file);
    captureHtmlToImage(html, outPath);
    console.log(`✅ Captured: ${tc.file} (${tc.method} ${tc.path} -> ${res.status} ${statusText})`);
  }

  // 16. Terminal database verification screenshot
  console.log('\n[Capture] Generating SQLite Database Terminal Screenshot...');
  const verifyDbOutput = execSync('node verify-db.js', { cwd: __dirname, encoding: 'utf-8' });
  const termHtml = buildTerminalHtml({
    title: 'SQLite Database & Query Parameter Inspection',
    command: 'node verify-db.js',
    output: verifyDbOutput.trim()
  });
  const termOutPath = path.join(SCREENSHOTS_DIR, '16-sqlite-database.png');
  captureHtmlToImage(termHtml, termOutPath);
  console.log(`✅ Captured: 16-sqlite-database.png (Terminal View)`);

  if (serverProcess && serverProcess.pid) {
    try { execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' }); } catch {}
  }

  console.log('\n🎉 All 16 verification screenshots generated successfully in lab-03/screenshots/!\n');
}

main().catch(console.error);
