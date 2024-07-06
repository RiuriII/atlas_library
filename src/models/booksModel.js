const db = require("./connection");

/**
 * Returns all books from the database
 * @returns {Promise<Array>} An array of books
 */
const getAll = async () => {
  const connection = await db.createConnectionPool();
  const [books] = await connection.execute("SELECT * FROM books");

  await db.closeConnectionPool();

  return books;
};

/**
 * Creates a new book in the database
 * @param {Object} book The book object to be created
 * @param {string} book.title The title of the book
 * @param {number} book.publication_year The year of publication
 * @param {boolean} book.available Whether the book is available or not
 * @param {string} book.status The status of the book
 * @param {number} book.rating The average rating of the book
 * @param {number} book.quantity The number of copies available
 * @param {string} book.description A description of the book
 * @param {number} book.author_id The ID of the author
 * @param {number} book.category_id The ID of the category
 * @returns {Promise<Object>} The created book
 */
const createBook = async (book) => {
  const connection = await db.createConnectionPool();

  const {
    title,
    publication_year,
    available,
    status,
    rating,
    quantity,
    description,
    authorId,
    categoryId
  } = book;

  const query = `
        INSERT INTO books(
          title,
          publication_year,
          available,
          status,
          rating,
          quantity, 
          description,
          fk_author_id, 
          fk_category_id
        ) 
        VALUES(?,?,?,?,?,?,?,?,?)`;

  const [createdBook] = await connection.execute(query, [
    title,
    publication_year,
    available,
    status,
    rating,
    quantity,
    description,
    authorId,
    categoryId
  ]);

  await db.closeConnectionPool();

  return { insertId: createdBook.insertId };
};

/**
 * Updates an existing book in the database
 * @param {number} bookId The ID of the book to be updated
 * @param {Object} updateFields The fields to be updated
 * @param {string} [updateFields.title] The title of the book
 * @param {number} [updateFields.publication_year] The year of publication
 * @param {boolean}[updateFields.available] Whether the book is available or not
 * @param {string} [updateFields.status] The status of the book
 * @param {number} [updateFields.rating] The average rating of the book
 * @param {number} [updateFields.quantity] The number of copies available
 * @param {string} [updateFields.description] A description of the book
 * @param {number} [updateFields.author_id] The ID of the author
 * @param {number} [updateFields.category_id] The ID of the category
 * @returns {Promise<Object>} The updated book.
 */
const updateBook = async (bookId, updateFields) => {
  const connection = await db.createConnectionPool();

  const updateKeys = Object.keys(updateFields);

  const fkMapping = {
    authorId: "fk_author_id",
    categoryId: "fk_category_id"
  };

  updateKeys.forEach((key, index) => {
    if (fkMapping[key]) {
      updateKeys[index] = fkMapping[key];
    }
  });

  const updateValues = Object.values(updateFields);

  const updateQuery = updateKeys.map((key) => `${key} = ?`).join(", ");

  const query = `UPDATE books SET ${updateQuery} WHERE book_id = ?`;
  const values = [...updateValues, bookId];

  const [updatedBook] = await connection.execute(query, values);

  await db.closeConnectionPool();

  return updatedBook;
};

/**
 * Deletes an existing book from the database
 * @param {number} bookId The ID of the book to be deleted
 * @returns {Promise<Object>} The deleted book
 * @throws {Error} If there is an error in deleting the book.
 */
const deleteBook = async (bookId) => {
  const connection = await db.createConnectionPool();

  const query = "DELETE FROM books WHERE book_id = ?";

  const [deletedBook] = await connection.execute(query, [bookId]);

  await db.closeConnectionPool();

  return deletedBook;
};

/**
 * Returns a book from the database based on its ID
 * @param {number} bookId The ID of the book
 * @returns {Promise<Object>} The book
 * @throws {Error} If there is an error in retrieving the book.
 */
const getBookById = async (bookId) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM books WHERE book_id = ?";

  const [book] = await connection.execute(query, [bookId]);

  await db.closeConnectionPool();

  return book;
};

/**
 * Checks the availability of a book in the database
 * @param {number} bookId The ID of the book
 * @returns {Promise<Object>} The book
 * @throws {Error} If there is an error in checking the book's availability.
 */
const checkBookAvailability = async (bookId) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT title, available, status FROM books WHERE book_id =?";

  const [book] = await connection.execute(query, [bookId]);

  await db.closeConnectionPool();

  return book;
};

module.exports = {
  getAll,
  createBook,
  updateBook,
  deleteBook,
  getBookById,
  checkBookAvailability
};
