# screenshots/
This folder contains the verification screenshots for Lab 03: REST API, Query Parameters, Validation, and Debugging.

## Required Screenshots Table

| File Name | Description | Endpoint / Method | Expected Status Code |
|---|---|---|:---:|
| `01-get-all-books.png` | Retrieve all books | `GET http://localhost:3000/books` | `200 OK` |
| `02-get-book-by-id.png` | Retrieve single book by ID | `GET http://localhost:3000/books/1` | `200 OK` |
| `03-post-create-book.png` | Create a new book | `POST http://localhost:3000/books` | `201 Created` |
| `04-put-update-book.png` | Update an existing book | `PUT http://localhost:3000/books/1` | `200 OK` |
| `05-delete-book.png` | Delete an existing book | `DELETE http://localhost:3000/books/11` | `200 OK` |
| `06-search-query.png` | Search books by title | `GET http://localhost:3000/books?search_q=JavaScript` | `200 OK` |
| `07-sort-price-desc.png` | Sort books by price DESC | `GET http://localhost:3000/books?order_by=price&order=DESC` | `200 OK` |
| `08-pagination-limit-offset.png` | Pagination limit & offset | `GET http://localhost:3000/books?limit=4&offset=0` | `200 OK` |
| `09-price-range-filter.png` | Price range filter | `GET http://localhost:3000/books?min_price=400&max_price=700` | `200 OK` |
| `10-validation-missing-title.png` | Validation: missing title | `POST http://localhost:3000/books` | `400 Bad Request` |
| `11-validation-missing-author.png` | Validation: missing author | `POST http://localhost:3000/books` | `400 Bad Request` |
| `12-validation-non-numeric-price.png` | Validation: non-numeric price | `POST http://localhost:3000/books` | `400 Bad Request` |
| `13-not-found-404.png` | Non-existing book ID | `GET http://localhost:3000/books/99999` | `404 Not Found` |
| `14-invalid-query-params.png` | Invalid query parameter | `GET http://localhost:3000/books?order_by=invalid_column` | `400 Bad Request` |
| `15-combined-query.png` | Combined Search + Filter + Sort + Limit | `GET http://localhost:3000/books?search_q=a&min_price=300&max_price=850&order_by=price&order=DESC&limit=3&offset=0` | `200 OK` |
| `16-sqlite-database.png` | Direct SQLite records check | `node verify-db.js` | Console Table |

## How to Capture Manually in Postman:
1. Start the server:
   ```bash
   cd lab-03
   npm run dev
   ```
2. Import `postman_collection.json` into Postman.
3. Execute each request.
4. Press `Win + Shift + S` on Windows to take a screenshot showing the request URL, request body, response status code, and response body.
5. Save the screenshot under `lab-03/screenshots/` with the corresponding filename.
