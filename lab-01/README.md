# Lab 01 — Node.js and Express Server

> **Live URL:** *(Not yet deployed — see Deployment section below)*

---

## 📋 Student Information

| Field               | Details                    |
|---------------------|----------------------------|
| **Student Name**    | Sree Charani               |
| **Reg. Number**     | 252U1R3059                 |
| **Section**         | CSE-DS-2B                  |
| **Lab Number**      | 01                         |
| **Lab Title**       | Node.js and Express Server |

---

## 🎯 Objective

The objective of this lab is to:

1. Understand the basics of **Node.js** and how it can handle HTTP requests without any external framework (using the built-in `http` module).
2. Learn how to build a web server with **Express.js** — a lightweight web framework.
3. Create multiple API endpoints (`GET /`, `GET /about`, `GET /time`, and a 404 fallback).
4. Understand **HTTP status codes**, JSON responses, and server-side routing.
5. Prepare the project for deployment on a cloud platform (Render).

---

## 🛠️ Technologies Used

| Technology    | Purpose                                 |
|---------------|-----------------------------------------|
| Node.js       | JavaScript runtime environment          |
| npm           | Package manager for Node.js             |
| Express.js    | Web framework for building the server   |
| http (module) | Built-in Node.js module for basic demo  |
| JavaScript    | Programming language used               |

**No environment variables are required** for this project.

---

## 📂 Project Folder Structure

```
lab-01/
├── basic-server.js       ← Basic HTTP server using built-in 'http' module
├── server.js             ← Main Express server with all routes
├── package.json          ← Project metadata and npm scripts
├── package-lock.json     ← Exact dependency lock file (auto-generated)
├── .gitignore            ← Excludes node_modules and .env from Git
├── README.md             ← This file
└── screenshots/
    ├── home.png          ← Screenshot of GET /
    ├── about.png         ← Screenshot of GET /about
    ├── time.png          ← Screenshot of GET /time
    └── not-found.png     ← Screenshot of GET /invalid (404)
```

> **Note:** `node_modules/` is excluded from GitHub via `.gitignore`.

---

## ⚙️ Installation

Follow these steps to set up the project on your local machine:

### Prerequisites
- **Node.js** (v18 or higher) — [Download here](https://nodejs.org/)
- **npm** (comes bundled with Node.js)

### Steps

```bash
# 1. Navigate into the lab-01 folder
cd lab-01

# 2. Install dependencies (creates node_modules/)
npm install
```

---

## ▶️ Running the Servers

### Run the Basic HTTP Server (Node.js built-in)

```bash
node basic-server.js
```

Expected terminal output:
```
Basic HTTP server is running on http://localhost:3000
Press Ctrl+C to stop the server.
```

Open your browser and visit: **http://localhost:3000**
You will see: `Hello`

---

### Run the Express Server

```bash
npm start
```

or equivalently:

```bash
node server.js
```

Expected terminal output:
```
Express server running on port 3000
Open http://localhost:3000 in your browser.
Press Ctrl+C to stop the server.
```

---

## 🌐 Endpoint Documentation

| Method | Endpoint   | Description                           | Status Code | Response Type |
|--------|------------|---------------------------------------|-------------|---------------|
| GET    | `/`        | Welcome message                       | 200         | text/plain    |
| GET    | `/about`   | Student/section information as JSON   | 200         | application/json |
| GET    | `/time`    | Current server date and time as JSON  | 200         | application/json |
| GET    | `/*`       | Any unknown URL returns 404 error     | 404         | text/plain    |

### Detailed Response Examples

#### `GET /`
```
Welcome to Node.js and Express Server!
```

#### `GET /about`
```json
{
  "name": "Reddy Mahitha",
  "section": "CSE-DS-2B"
}
```

#### `GET /time`
```json
{
  "currentDateTime": "Sun Nov 01 2026 23:45:30 GMT+0530 (India Standard Time)",
  "isoFormat": "2026-11-01T18:15:30.553Z",
  "timestamp": 1793556930553
}
```

#### `GET /invalid` (or any unknown path)
```
404 - Page Not Found
```

---

## 📊 HTTP Status Codes Used

| Code | Name      | When it is returned                       |
|------|-----------|-------------------------------------------|
| 200  | OK        | Request was successful                    |
| 404  | Not Found | The requested URL does not exist          |

---

## 📸 Screenshots

> **Note:** Run `npm start` and visit each URL below in your browser, then take screenshots and save them in the `screenshots/` folder.

### Home Page — `GET /`
![Home page response](./screenshots/home.png)

### About Page — `GET /about`
![About page JSON response](./screenshots/about.png)

### Time Page — `GET /time`
![Time page JSON response](./screenshots/time.png)

### 404 Not Found — `GET /invalid`
![404 Not Found response](./screenshots/not-found.png)

---

## ⚠️ Problems Faced & Solutions

| Problem | Solution |
|---------|----------|
| 404 middleware catching all routes including defined ones | Placed the `app.use()` catch-all **after** all other `app.get()` routes — Express processes routes in order. |
| `process.env.PORT` causing port mismatch on Render | Used `const PORT = process.env.PORT \|\| 3000` to fall back to 3000 locally while using the platform-provided port in production. |
| `node_modules` accidentally tracked by Git | Added `node_modules/` to `.gitignore` before the first `git add`. |

---

## 🏁 Conclusion

In this lab, I learned how to:
- Create a basic HTTP server using Node.js's built-in `http` module.
- Set up an Express application with multiple routes.
- Return both plain-text and JSON responses with appropriate HTTP status codes.
- Handle undefined routes using Express middleware.
- Prepare a Node.js application for cloud deployment using `process.env.PORT`.

---

## 🚀 Deployment (Render)

This project is ready to be deployed on [Render](https://render.com).

### Steps to Deploy on Render

1. **Push the code to GitHub** (see Git section below).
2. Go to [https://render.com](https://render.com) and sign in.
3. Click **"New +"** → **"Web Service"**.
4. Connect your GitHub account and select your repository.
5. Configure the service:
   - **Name:** `lab-01-express-server` (or any name)
   - **Root Directory:** `lab-01`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Click **"Create Web Service"**.
7. Render will automatically set the `PORT` environment variable.
8. Once deployed, update the **Live URL** at the top of this README.

> ⚠️ **Do not deploy without permission.** The live URL placeholder at the top will be filled in after successful deployment.

---

## 🐙 Git — Upload to GitHub

> ⚠️ **Read before running:** This assumes your parent folder (`nodejs-course/`) is already a Git repository. Do NOT run `git init` inside `lab-01/`.

```bash
# Navigate to the parent repository root (not inside lab-01)
cd ..

# Stage the entire lab-01 folder
git add lab-01/

# Commit with a clear message
git commit -m "Add Lab 01: Node.js and Express Server"

# Push to GitHub (replace 'main' with your branch name if different)
git push origin main
```

---

## ❓ Viva Questions & Answers

**Q1. What is Node.js?**  
Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows JavaScript to run on the server side (outside the browser), enabling you to build web servers, APIs, and command-line tools.

**Q2. What is the difference between the `http` module and Express?**  
The `http` module is built into Node.js and provides low-level server creation. Express is a third-party framework built on top of `http` that makes routing, middleware, and request/response handling much simpler and more readable.

**Q3. What does `require()` do?**  
`require()` is Node.js's way of importing a module. `require('http')` loads the built-in HTTP module; `require('express')` loads the Express package from `node_modules/`.

**Q4. What is `app.use()` and why is the 404 middleware placed last?**  
`app.use()` registers middleware — functions that run during the request–response cycle. The 404 handler is placed **last** because Express processes routes in the order they are defined. If no route above it matched, the 404 middleware runs as a fallback.

**Q5. What is `process.env.PORT` and why do we use it?**  
`process.env.PORT` is an environment variable set by hosting platforms like Render. When deployed, the platform picks a port dynamically. Using `process.env.PORT || 3000` means: *use the platform's port if available, otherwise fall back to 3000 for local development.*

**Q6. What is `res.json()` vs `res.send()`?**  
`res.send()` sends a response of any type. `res.json()` automatically converts a JavaScript object to a JSON string and sets the `Content-Type` header to `application/json`.

**Q7. What does `npm init -y` do?**  
It creates a `package.json` file with default values, skipping the interactive prompts. The `-y` flag means "yes to all defaults."

**Q8. What is `package-lock.json`?**  
It records the exact version of every installed package (including nested dependencies) so that `npm install` produces the same `node_modules/` on any machine, ensuring reproducibility.

**Q9. What HTTP status code does Express send by default?**  
Express sends `200` (OK) by default. You can override this with `res.status(404)` or any other code.

**Q10. What is `.gitignore` used for?**  
`.gitignore` tells Git which files and folders to ignore and not track. We add `node_modules/` because it can contain thousands of files that can be regenerated by running `npm install`; including them would bloat the repository unnecessarily.
