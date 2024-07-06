const db = require("./connection");

/**
 * Retrieves all authors from the database.
 *
 * @return {Promise<Array>} An array of author objects.
 */
const getAll = async () => {
  const connection = await db.createConnectionPool();
  const [authors] = await connection.execute("SELECT * FROM authors");
  await db.closeConnectionPool();
  return authors;
};

/**
 * Retrieves all authors from the database.
 *
 * @param {object} author - An object containing the author's name and about.
 * @param {string} author.name - Name of the author.
 * @param {string} author.about - About of the author.
 * @return {Promise<Object>} An object with the insertId of the author.
 */
const createAuthor = async (author) => {
  const connection = await db.createConnectionPool();

  const { name, about } = author;

  const query = `
        INSERT INTO authors(
            name, about
        ) 
        VALUES(?,?)`;

  const [createdAuthor] = await connection.execute(query, [name, about]);
  await db.closeConnectionPool();

  return { insertId: createdAuthor.insertId };
};

/**
 * Updates an existing author in the database
 * @param {number} authorId The ID of the author to be updated
 * @param {Object} updateFields The fields to be updated
 * @param {string} [updateFields.name] The new name of the author
 * @param {string} [updateFields.about] The new about of the author
 * @returns {Promise<Object>} The updated author
 */
const updateAuthor = async (authorId, updateFields) => {
  const connection = await db.createConnectionPool();

  const updateKeys = Object.keys(updateFields);
  const updateValues = Object.values(updateFields);

  const updateQuery = updateKeys.map((key) => `${key} = ?`).join(", ");

  const query = `UPDATE authors SET ${updateQuery} WHERE author_id = ?`;
  const values = [...updateValues, authorId];

  const [updatedAuthor] = await connection.execute(query, values);
  await db.closeConnectionPool();

  return updatedAuthor;
};

/**
 * Deletes an existing author from the database
 * @param {number} authorId The ID of the author to be deleted
 * @returns {Promise<Object>} The deleted author
 */
const deleteAuthor = async (authorId) => {
  const connection = await db.createConnectionPool();

  const query = "DELETE FROM authors WHERE author_id = ?";

  const [deletedAuthor] = await connection.execute(query, [authorId]);
  await db.closeConnectionPool();

  return deletedAuthor;
};

/**
 * Returns a author from the database based on its ID
 * @param {number} authorId The ID of the author to be retrieved
 * @returns {Promise<Object>} The retrieved author
 */
const getAuthorById = async (authorId) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM authors WHERE author_id = ?";

  const [author] = await connection.execute(query, [authorId]);
  await db.closeConnectionPool();

  return author;
};

module.exports = {
  getAll,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorById
};
