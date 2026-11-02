# screenshots/
This folder contains the verification screenshots for Lab 02: SQLite Database and CRUD Routes.

## Required Screenshots Table

| File Name | Description | Endpoint / Command | Expected Status / View |
|---|---|---|---|
| `get-all-books.png` | Retrieve all 10 books | `GET http://localhost:3000/books/` | `200 OK` (JSON array of 10 books) |
| `get-book-by-id.png` | Retrieve single book | `GET http://localhost:3000/books/1/` | `200 OK` (Book object with ID 1) |
| `post-book.png` | Insert new book | `POST http://localhost:3000/books/` | `201 Created` (`bookId: 11`) |
| `put-book.png` | Update book | `PUT http://localhost:3000/books/1/` | `200 OK` ("Book updated successfully") |
| `delete-book.png` | Delete book | `DELETE http://localhost:3000/books/1/` | `200 OK` ("Book deleted successfully") |
| `sqlite-database.png` | SQLite records verification | `node verify-db.js` or SQLite CLI | Formatted table of books in database |

## How to Capture the Screenshots

### 1. In Postman:
1. Open Postman.
2. Click **Import** (top left) and select the `postman_collection.json` file inside `lab-02`.
3. Start the server in your terminal:
   ```bash
   npm run dev
   ```
4. For each request:
   - Click the request in the left sidebar.
   - Click **Send**.
   - Press **Windows Key + Shift + S** to capture the Postman window showing the request URL, body, response body, and status code.
   - Save the image with the corresponding name into this `screenshots/` directory.

### 2. For SQLite Database View (`sqlite-database.png`):
- Run in terminal:
  ```bash
  node verify-db.js
  ```
- Or open `books.db` in VS Code using the **SQLite Viewer** extension.
- Capture the table display showing the columns (`id`, `title`, `author`, `price`, `pages`) and save as `sqlite-database.png`.
