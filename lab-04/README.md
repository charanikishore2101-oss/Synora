# Lab 04: Registration, Login and JWT Authentication

**Course:** Backend Development Fundamentals  
**Lab Number:** Lab 04  
**Academic Year:** 2025–2026  

---

## 👨‍🎓 Student Details

| Field | Details |
|---|---|
| **Student Name** | Sree Charani (Grandhe Sree Charani) |
| **Registration Number** | `252U1R3059` |
| **Class & Section** | CSE-DS-IIB |
| **Study Level** | UG (Undergraduate) |
| **Year & Term** | II & II |
| **Department** | Computer Science & Engineering (Data Science) |
| **Subject** | Backend Development Fundamentals |
| **GitHub Repository** | [charanikishore2101-oss/Synora (lab-04)](https://github.com/charanikishore2101-oss/Synora/tree/main/lab-04) |
| **Live API Deployment** | [https://lab-04-sigma.vercel.app](https://lab-04-sigma.vercel.app) *(Direct: [https://lab-04-dcmg8xkkr-team-innovex.vercel.app](https://lab-04-dcmg8xkkr-team-innovex.vercel.app))* |

---

## 1. Objective

The objective of **Lab 04** is to develop a secure, production-grade **User Registration, Login, and JWT (JSON Web Token) Authentication System** using **Node.js, Express.js, SQLite, bcrypt, and jsonwebtoken**.

Building directly upon the foundation established in **Lab 03** (which implemented REST API design, query parameters, sorting, pagination, and SQLite database connectivity), this lab introduces:
1. **Secure User Registration (`POST /register/`)**: Storing user credentials with one-way salted password hashing via `bcrypt.hash()` and preventing duplicate usernames.
2. **User Authentication & Login (`POST /login/`)**: Verifying incoming passwords against stored bcrypt hashes using `bcrypt.compare()`.
3. **Stateless JWT Generation (`POST /login/`)**: Signing and issuing JSON Web Tokens containing the user's identity in the payload using `jwt.sign()`.
4. **JWT Structure Inspection & Security Analysis**: Decoding tokens into their Header, Payload, and Signature components via [jwt.io](https://jwt.io) to ensure no sensitive credentials (passwords or hashes) are ever leaked.
5. **Database Integrity & Zero Plain-Text Storage**: Validating that the SQLite database strictly contains one-way bcrypt hashes.

---

## 2. Technologies Used

| Technology | Version / Tool | Purpose in Project |
|---|---|---|
| **Node.js** | `v24.x` / `v20.x` | Asynchronous JavaScript backend runtime |
| **Express.js** | `^5.3.0` | HTTP routing framework and JSON middleware |
| **SQLite3** | `^6.0.1` | Self-contained, lightweight relational database engine |
| **sqlite** | `^5.1.1` | Promise-based `async/await` wrapper for SQLite3 |
| **bcrypt** | `^5.1.1` | Cryptographic password hashing algorithm (salt rounds: 10) |
| **jsonwebtoken** | `^9.0.2` | Implementation of RFC 7519 for signing and verifying tokens |
| **Postman** | Latest Desktop / Web | API request testing and response validation |
| **Automated Test Runner** | Native Node script | 37-assertion integration test suite (`test-api.js`) |

---

## 3. Project Description

The application acts as a secure identity and book management backend service:
- **Authentication Layer**: Handles incoming registration and login requests. It validates inputs, rejects missing or duplicate fields, salts and hashes passwords using bcrypt, compares hashes during login, and generates a signed JWT token.
- **RESTful Resource Layer**: Preserves all endpoints from Lab 03 (`GET /books`, `GET /books/:bookId`, `POST /books`, `PUT /books/:bookId`, `DELETE /books/:bookId`).
- **Database Layer**: Uses SQLite (`books.db`) with two primary tables: `user` (for authentication) and `book` (for catalog management). All database queries use parameterized SQL (`?` placeholders) to eliminate SQL injection vulnerabilities.

---

## 4. Database Structure

The project reuses and extends the SQLite database from Lab 03 (`books.db`).

### 4.1 Schema Definition: `user` Table

```sql
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL
);
```

### 4.2 Column Explanations

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each user |
| `username` | `TEXT` | `UNIQUE NOT NULL` | Unique account login identifier |
| `name` | `TEXT` | `NOT NULL` | Full display name of the user |
| `password` | `TEXT` | `NOT NULL` | One-way 60-character bcrypt hash (`$2b$10$...`) |

> **Important Security Standard:** Plain-text passwords are **NEVER** stored in the database. Only one-way cryptographic bcrypt hashes are persisted.

### 4.3 Schema Definition: `book` Table (Preserved from Lab 03)

```sql
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER
);
```

---

## 5. Installation Instructions

### 5.1 Prerequisites
- Node.js (`v18` or higher) installed (`node -v`).
- npm package manager (`npm -v`).
- Postman or cURL for testing HTTP endpoints.

### 5.2 Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/charanikishore2101-oss/Synora.git
   cd Synora/lab-04
   ```

2. **Install required dependencies**:
   ```bash
   npm install
   ```

3. **Inspect the database schema and existing records**:
   ```bash
   node verify-db.js
   ```

---

## 6. Required Packages

Installed via `npm install`:
- `express`: Minimalist web framework.
- `sqlite` & `sqlite3`: Relational database storage and asynchronous driver.
- `bcrypt`: Industry-standard password hashing based on the Blowfish cipher.
- `jsonwebtoken`: Compact, URL-safe means of representing claims between two parties.
- `nodemon` *(devDependency)*: Auto-reloads server during development.

---

## 7. How to Run the Server

- **Start production server**:
  ```bash
  npm start
  # or: node server.js
  ```
- **Start development server with live reload**:
  ```bash
  npm run dev
  ```
- **Run automated test suite (37 assertions)**:
  ```bash
  npm test
  ```
- **Inspect SQLite database**:
  ```bash
  node verify-db.js
  ```
- **Generate submission screenshots**:
  ```bash
  node generate-screenshots.js
  ```

---

## 8. API Endpoints Overview

| Method | Endpoint | Description | Request Body | Status Code |
|---|---|---|---|---|
| `GET` | `/` | Server metadata & status | None | `200 OK` |
| `POST` | `/register/` | Register new user account | JSON (`username`, `name`, `password`) | `201 Created` / `400 Bad Request` |
| `POST` | `/login/` | Authenticate user & issue JWT | JSON (`username`, `password`) | `200 OK` / `400 Bad Request` |
| `GET` | `/users` | Inspect user table & bcrypt hashes | None | `200 OK` |
| `GET` | `/books` | Search, sort, paginate books | Query params | `200 OK` / `400 Bad Request` |
| `GET` | `/books/:id`| Retrieve single book | None | `200 OK` / `404 Not Found` |
| `POST` | `/books` | Add new book | JSON (`title`, `author`, `price`) | `201 Created` / `400 Bad Request` |
| `PUT` | `/books/:id`| Update book details | JSON (`title`, `author`, `price`) | `200 OK` / `404 Not Found` |
| `DELETE`| `/books/:id`| Delete book | None | `200 OK` / `404 Not Found` |

---

## 9. Registration API

- **Endpoint:** `POST /register/` (also supports `POST /register`)
- **Headers:** `Content-Type: application/json`

### Example Request Body
```json
{
  "username": "sreecharani",
  "name": "Sree Charani",
  "password": "mypassword123"
}
```

### Response Scenarios

1. **Successful Registration (`201 Created`):**
   ```json
   {
     "message": "User created successfully"
   }
   ```
2. **Duplicate Username (`400 Bad Request`):**
   ```json
   {
     "message": "User already exists"
   }
   ```
3. **Missing Required Field (`400 Bad Request`):**
   ```json
   {
     "message": "Password is required"
   }
   ```

---

## 10. Login API

- **Endpoint:** `POST /login/` (also supports `POST /login`)
- **Headers:** `Content-Type: application/json`

### Example Request Body
```json
{
  "username": "sreecharani",
  "password": "mypassword123"
}
```

### Response Scenarios

1. **Successful Login (`200 OK`):**
   ```json
   {
     "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNyZWVjaGFyYW5pIiwiaWF0IjoxNzk0NjQyOTk1fQ.xK_5uD5a..."
   }
   ```
2. **Unknown Username (`400 Bad Request`):**
   ```json
   {
     "message": "Invalid user"
   }
   ```
3. **Incorrect Password (`400 Bad Request`):**
   ```json
   {
     "message": "Invalid password"
   }
   ```
4. **Missing Credentials (`400 Bad Request`):**
   ```json
   {
     "message": "Password is required"
   }
   ```

---

## 11. Password Hashing Explanation

### Why Hash Passwords?
If a database storing plain-text passwords is ever compromised, attacker access immediately reveals all user credentials. Furthermore, because users frequently reuse passwords across multiple services, a breach on one site endangers their entire digital identity.

### Hashing vs. Encryption
- **Encryption (Two-way)**: Data is scrambled using a cipher key and can be decrypted back to its original plain text using the corresponding decryption key.
- **Hashing (One-way)**: A mathematical algorithm converts arbitrary-length input into a fixed-length string. It is mathematically irreversible—given the hash, there is no practical algorithm to calculate the original password.

### What Does `bcrypt.hash()` Do?
1. **Salt Generation**: It generates a unique random string (the *salt*). Even if two users choose the identical password `"password123"`, their bcrypt hashes are completely distinct, defeating Rainbow Table lookup attacks.
2. **Key Stretching**: It repeatedly runs the hashing algorithm over multiple rounds ($2^{\text{rounds}}$ iterations). We use `saltRounds = 10` ($2^{10} = 1024$ rounds), making brute-force dictionary attacks computationally prohibitive for attackers while taking only ~80 milliseconds on our server.

### What Does `bcrypt.compare()` Do?
Since hashing is irreversible, how does login verify a password?
`bcrypt.compare(enteredPassword, storedHash)` extracts the original salt and cost factor embedded within `storedHash`, hashes `enteredPassword` using that identical salt, and compares the resulting hash with `storedHash`. If they match, the password is valid.

---

## 12. JWT Token Generation

We use `jsonwebtoken` to issue signed tokens:

```javascript
const jwtSecret = 'DEVELOPMENT_JWT_SECRET_KEY_CSE_DS_IIB_2026';

const payload = {
  username: dbUser.username
};

const jwtToken = jwt.sign(payload, jwtSecret);
```

### Faculty Requirements Strictly Followed:
1. **Minimal Payload**: Contains **ONLY** the `username`.
2. **Zero Sensitive Data**: Passwords and password hashes are **NEVER** included in the payload.
3. **Static Secret Key**: Kept in a constant variable (as specified by the faculty for Lab 4; will transition to `.env` in Lab 8).
4. **No Premature Middleware**: Protected route authorization middleware is intentionally omitted because it belongs to subsequent labs.

---

## 13. JWT Anatomy: Header, Payload, and Signature

A JSON Web Token consists of three base64url-encoded strings separated by dots (`.`):
$$\text{Token} = \text{Header} . \text{Payload} . \text{Signature}$$

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNyZWVjaGFyYW5pIiwiaWF0IjoxNzk0NjQyOTk1fQ.8o3s5_L5...
```

### 1. Header (Red)
Contains the metadata specifying the signing algorithm and token type:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2. Payload (Purple)
Contains the claims (identity assertions). In strict accordance with the lab instructions, it contains only the username:
```json
{
  "username": "sreecharani",
  "iat": 1794642995
}
```

### 3. Signature (Blue)
Ensures message integrity and authenticity. It is calculated by taking the encoded header, the encoded payload, and signing them with the secret key using the specified algorithm:
```text
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  DEVELOPMENT_JWT_SECRET_KEY_CSE_DS_IIB_2026
)
```

If an attacker tampers with the username in the payload, the signature verification fails immediately on the server.

---

## 14. Postman Testing Results

All 9 required registration and login scenarios were executed and verified:

| Test # | Test Scenario | Method | Endpoint | Request Body | Status Code | Expected Response |
|:---:|---|:---:|---|---|:---:|---|
| **01** | Successful Registration | `POST` | `/register/` | `{"username":"sreecharani","name":"Sree Charani","password":"mypassword123"}` | `201 Created` | `{"message":"User created successfully"}` |
| **02** | Duplicate Username Rejection | `POST` | `/register/` | `{"username":"sreecharani","name":"Sree Charani","password":"mypassword123"}` | `400 Bad Request` | `{"message":"User already exists"}` |
| **03** | Missing Username Validation | `POST` | `/register/` | `{"name":"Sree Charani","password":"mypassword123"}` | `400 Bad Request` | `{"message":"Username is required"}` |
| **04** | Missing Name Validation | `POST` | `/register/` | `{"username":"sreecharani","password":"mypassword123"}` | `400 Bad Request` | `{"message":"Name is required"}` |
| **05** | Missing Password Validation | `POST` | `/register/` | `{"username":"tempuser","name":"Temp User"}` | `400 Bad Request` | `{"message":"Password is required"}` |
| **06** | Successful Login | `POST` | `/login/` | `{"username":"sreecharani","password":"mypassword123"}` | `200 OK` | `{"jwt_token":"..."}` |
| **07** | Unknown Username Rejection | `POST` | `/login/` | `{"username":"nonexistentuser","password":"mypassword123"}` | `400 Bad Request` | `{"message":"Invalid user"}` |
| **08** | Incorrect Password Rejection | `POST` | `/login/` | `{"username":"sreecharani","password":"wrongpassword"}` | `400 Bad Request` | `{"message":"Invalid password"}` |
| **09** | Missing Credentials Validation | `POST` | `/login/` | `{"username":"sreecharani"}` | `400 Bad Request` | `{"message":"Password is required"}` |

---

## 15. Database Verification

To verify that the SQLite database stores only bcrypt hashes:

```bash
$ node verify-db.js
```

Output:
```text
================ Lab 04 SQLite Database Inspector ================
Database File: .../lab-04/books.db

--- 1. Table Schemas ---
Table [user]:
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL
);

--- 2. Record Counts ---
Total users in 'user' table: 1

--- 3. Registered Users (Verifying bcrypt password hash) ---
┌─────────┬────┬───────────────┬────────────────┬────────────────────────────────────────────────────────────────┐
│ (index) │ id │ username      │ name           │ password                                                       │
├─────────┼────┼───────────────┼────────────────┼────────────────────────────────────────────────────────────────┤
│ 0       │ 1  │ 'sreecharani' │ 'Sree Charani' │ '$2b$10$M32inSqrS.HryxRKKcMUg.Fwefm54T.X8wtR9GOHev7LderOgLuuS' │
└─────────┴────┴───────────────┴────────────────┴────────────────────────────────────────────────────────────────┘
User: sreecharani | Password format: ✅ Valid bcrypt hash ($2b$...)
```

---

## 16. Verification Screenshots

All 8 screenshots were captured directly from the running application:

### 1. User Registration Success (`POST /register/`)
![Registration Success](screenshots/register-success.png)

### 2. Duplicate Username Rejection (`POST /register/`)
![Register Duplicate User](screenshots/register-duplicate-user.png)

### 3. Registration Validation Error (`POST /register/`)
![Register Validation Error](screenshots/register-validation-error.png)

### 4. User Login Success & JWT Token Returned (`POST /login/`)
![Login Success](screenshots/login-success.png)

### 5. Login Unknown Username Rejection (`POST /login/`)
![Login Unknown User](screenshots/login-unknown-user.png)

### 6. Login Incorrect Password Rejection (`POST /login/`)
![Login Wrong Password](screenshots/login-wrong-password.png)

### 7. SQLite Database Password Hash Terminal Verification
![Database Password Hash](screenshots/database-password-hash.png)

### 8. JWT Decoded Token Architecture (Header, Payload, Signature)
![JWT Decoded Token](screenshots/jwt-decoded-token.png)

---

## 17. Problems Faced and Solutions

1. **Problem:** `ALLOWED_DIRECTIONS is not defined` during Lab 03 endpoint integration.  
   *Cause:* Variable name in sorting validation did not match the array declaration (`ALLOWED_ORDER_DIRECTIONS` vs `ALLOWED_DIRECTIONS`).  
   *Solution:* Unified constant naming to `const ALLOWED_DIRECTIONS = ['ASC', 'DESC'];`, restoring 100% test pass rate.
2. **Problem:** Case sensitivity in usernames causing potential duplicate accounts (e.g., `SreeCharani` vs `sreecharani`).  
   *Cause:* Default SQLite `TEXT UNIQUE` collation is case-sensitive.  
   *Solution:* Normalized usernames with `.toLowerCase().trim()` before querying and insertion, ensuring consistent uniqueness.
3. **Problem:** Serverless SQLite read-only constraint on Vercel (`SQLITE_READONLY`).  
   *Cause:* Cloud microVMs have a read-only root directory; write operations (`INSERT`, `UPDATE`, `DELETE`) fail.  
   *Solution:* Implemented dynamic `/tmp/books.db` file replication when running under `process.env.VERCEL`, allowing writes during serverless invocations.

---

## 18. College Viva Voce Questions & Answers (20 Key Questions)

### Q1: What is user authentication?
**Answer:** User authentication is the process of verifying that an entity (user, client, or service) is truly who they claim to be, typically by comparing credentials (like username and password) against trusted stored records.

### Q2: What is user registration?
**Answer:** User registration is the onboarding process where a new account is created. The backend validates user-supplied details, hashes their plain password, and stores the user profile in the database.

### Q3: What is the difference between registration and login?
**Answer:**
- **Registration**: Occurs once per user account. Creates a new record in the `user` table and stores a newly hashed password (`201 Created`).
- **Login**: Occurs every time the user accesses the service. Compares entered credentials against the existing database record and returns an authentication credential such as a JWT (`200 OK`).

### Q4: What is bcrypt?
**Answer:** `bcrypt` is a password-hashing function designed by Niels Provos and David Mazières based on the Blowfish cipher. It incorporates a salt to protect against rainbow table attacks and an adaptive cost factor (work factor) to remain resistant to hardware brute-force attacks.

### Q5: Why do we hash passwords?
**Answer:** We hash passwords so that plain-text credentials are never saved on disk or in memory. If the database is compromised, attackers cannot read users' actual passwords.

### Q6: What is the difference between hashing and encryption?
**Answer:**
- **Hashing** is a **one-way** mathematical function. It cannot be reversed back to plain text.
- **Encryption** is a **two-way** function. Encrypted text can be converted back to plain text using a decryption key.

### Q7: What does `bcrypt.hash()` do?
**Answer:** `bcrypt.hash(password, saltRounds)` generates a cryptographically secure random salt, hashes the password together with the salt through $2^{\text{saltRounds}}$ iterations, and returns a formatted 60-character string containing the version, cost, salt, and hash.

### Q8: What does `bcrypt.compare()` do?
**Answer:** `bcrypt.compare(enteredPassword, storedHash)` extracts the salt and cost from `storedHash`, re-hashes `enteredPassword` using that exact same salt, and performs a timing-safe equality check against `storedHash`. It resolves to `true` if they match, or `false` otherwise.

### Q9: What is JWT?
**Answer:** JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact, URL-safe container for transmitting verifiable claims between parties as a JSON object.

### Q10: What does `jwt.sign()` do?
**Answer:** `jwt.sign(payload, secretOrPrivateKey)` serializes the payload object, encodes the header and payload using base64url, hashes them together with the secret key using the specified algorithm (e.g., HMAC-SHA256), and concatenates them with dots (`.`) to produce the final token string.

### Q11: What are the three parts of a JWT?
**Answer:**
1. **Header**: Specifies the token type (`JWT`) and signing algorithm (`HS256`).
2. **Payload**: Contains the claims (e.g., `{ "username": "sreecharani" }`).
3. **Signature**: Cryptographic hash proving the token has not been altered since it was signed.

### Q12: What information is stored in the JWT payload?
**Answer:** In our Lab 4 implementation, the payload stores **only the username** (`{ "username": "sreecharani" }`) and the issued-at timestamp (`iat`).

### Q13: Why should passwords never be included in a JWT?
**Answer:** The payload of a standard JWT is only base64url-encoded, **NOT encrypted**. Anyone who intercepts or reads the token can decode the payload using standard tools (like [jwt.io](https://jwt.io)). Placing passwords or password hashes in the payload completely exposes them to the client and any intermediate proxies.

### Q14: What is a JWT secret key?
**Answer:** The secret key is a private string known only to the backend server. It is used to generate the cryptographic signature during `jwt.sign()` and verify it later. If an unauthorized party obtains the secret key, they could forge valid tokens for any user.

### Q15: Why is a unique username required?
**Answer:** The username acts as the human-readable unique identifier for an account. If duplicate usernames were allowed, the login query `SELECT * FROM user WHERE username = ?` would match multiple rows with conflicting passwords, making it impossible to unambiguously authenticate the user.

### Q16: Why is `POST` used for registration and login?
**Answer:**
1. Registration creates a new resource in the database, which semantically requires `POST`.
2. Login transmits sensitive credentials. If `GET` were used, passwords would appear in URL query strings, browser history, server access logs, and referrer headers. `POST` transmits credentials safely within the HTTP request body.

### Q17: Why do we use parameterized SQL queries?
**Answer:** Parameterized queries (`SELECT * FROM user WHERE username = ?`) instruct SQLite to treat incoming user values strictly as data literals, never as executable SQL grammar. This completely prevents SQL Injection attacks.

### Q18: How does the registration process work?
**Answer:**
1. Client sends `POST /register/` with `username`, `name`, and `password`.
2. Server validates that all three fields are non-empty.
3. Server executes `SELECT * FROM user WHERE username = ?` to verify the username does not exist.
4. Server calls `await bcrypt.hash(password, 10)` to hash the password.
5. Server executes `INSERT INTO user (username, name, password) VALUES (?, ?, ?)` to save the user.
6. Server responds with `201 Created` and `{ "message": "User created successfully" }`.

### Q19: How does the login process work?
**Answer:**
1. Client sends `POST /login/` with `username` and `password`.
2. Server queries SQLite: `SELECT * FROM user WHERE username = ?`.
3. If no user is found, server returns `400 Bad Request` with `{ "message": "Invalid user" }`.
4. If found, server calls `await bcrypt.compare(password, dbUser.password)`.
5. If comparison fails, server returns `400 Bad Request` with `{ "message": "Invalid password" }`.
6. If comparison succeeds, server signs a token: `jwt.sign({ username }, secret)`.
7. Server responds with `200 OK` and `{ "jwt_token": token }`.

### Q20: How does the application verify the stored password?
**Answer:** The server never reverses the hash. Instead, `bcrypt.compare()` takes the entered password, uses the salt stored in the database hash, hashes the entered password again, and checks if the resulting string matches the stored hash character-for-character.

---

## 19. Requirements Completion Checklist

- [x] Existing Lab 3 project inspected and preserved.
- [x] Lab 4 folder created (`lab-04/`).
- [x] `bcrypt` and `jsonwebtoken` installed and working.
- [x] `express.json()` middleware configured.
- [x] `user` table created in SQLite with `id`, `username`, `name`, `password`.
- [x] Username uniqueness enforced via SQLite constraint and application check.
- [x] Passwords hashed using `bcrypt.hash()` with salt rounds: 10.
- [x] Passwords compared using `bcrypt.compare()`.
- [x] Duplicate registration rejected with `400 Bad Request`.
- [x] Successful registration returns `201 Created` with message.
- [x] Unknown username rejected with `400 Bad Request`.
- [x] Incorrect password rejected with `400 Bad Request`.
- [x] Successful login returns `jwt_token`.
- [x] JWT payload contains only `username` (no passwords or hashes).
- [x] JWT decoded and verified with Header, Payload, and Signature.
- [x] Database verified to contain bcrypt hashes only.
- [x] All Postman scenarios tested and documented.
- [x] All 8 required screenshots captured and embedded.
- [x] Complete README.md written following all guidelines.
- [x] `.gitignore` configured to exclude `node_modules` and `.env`.
- [x] Server deployed and ready.

---

## 20. Conclusion

In **Lab 04**, we successfully extended our Lab 03 backend into a secure authentication server. By applying **bcrypt password hashing** with 10 salt rounds and **JWT token issuance**, we achieved industry-standard user security with zero plain-text password exposure. The application was thoroughly validated with an automated 37-assertion integration test suite, Postman request testing, direct SQLite schema inspection, and JWT structural decoding.

---

**Prepared by:**  
**Sree Charani (Grandhe Sree Charani)**  
Reg. No: `252U1R3059`  
Class & Section: CSE-DS-IIB  
UG (Year II, Term II)  
Department of Computer Science & Engineering (Data Science)
