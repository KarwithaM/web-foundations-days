# Library API Design

This document outlines the RESTful API endpoints for managing a library's book resources.

## Endpoints

### 1. List all books

- **Method:** `GET`
- **Path:** `/books`
- **Description:** Retrieves a list of all books in the library.
- **Success Status:** `200 OK`

### 2. Get a specific book

- **Method:** `GET`
- **Path:** `/books/{id}`
- **Description:** Retrieves the details of a single book by its unique ID.
- **Success Status:** `200 OK`

### 3. Create a new book

- **Method:** `POST`
- **Path:** `/books`
- **Description:** Adds a new book to the library collection.
- **Request Body:**
  ```json
  {
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "year": 1937
  }
  ```
- **Success Status:** `201 Created`

### 4. Update an existing book

- **Method:** `PUT` (or `PATCH`)
- **Path:** `/books/{id}`
- **Description:** Replaces the details of an existing book with new data.
- **Request Body**:
  ```json
  {
    "title": "The Hobbit (Revised Edition)",
    "author": "J.R.R. Tolkien",
    "year": 1937
  }
  ```
- **Success Status:** `200 OK`

### 5. Delete a book

- **Method:** `DELETE`
- **Path:** `/books/{id}`
- **Description:** Removes a book from the library collection by its ID.
- **Success Status:** `204 No Content`

### 6. List books by a specific author

- **Method:** `GET`
- **Path:** `/books?author=J.R.R.%20Tolkien`
- **Description:** Retrieves a filtered list of books written by a specific author using a query parameter.
- **Success Status:** `200 OK`

---

## Error Codes

- **400 Bad Request**
  **When it happens:** The client sends invalid data. For example, trying to `POST` a new book without providing a required title field, or sending malformed JSON.

- **404 Not Found**
  **When it happens:** The requested resource does not exist. For example, trying to `GET /books/999` when there is no book with the ID of 999 in the database.
