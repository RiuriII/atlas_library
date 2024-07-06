const db = require("./connection");

/**
 * createFine
 * @param {number} amount - The amount to be paid
 * @param {string} dueDate - The due date of the fine
 * @param {number} userId - The user ID of the fine
 * @param {number} bookId - The book ID of the fine
 * @param {number} loanId - The loan ID of the fine
 *
 * @returns {Promise<object>}  The id of the created fine
 */
const createFine = async ({ amount, dueDate, userId, bookId, loanId }) => {
  const connection = await db.createConnectionPool();

  const query =
    "INSERT INTO fines(amount, paid, due_date, fk_user_id, fk_book_id, fk_loan_id) VALUES (?, ?, ?, ?, ?, ?)";
  const [createdFine] = await connection.execute(query, [
    amount,
    false,
    dueDate,
    userId,
    bookId,
    loanId
  ]);

  await db.closeConnectionPool();

  return { insertId: createdFine.insertId };
};

/**
 * updateFine
 * @param {number} fineId - The ID of the fine to be updated
 * @param {boolean} paid - Whether the fine is paid
 * @param {string} payment_date - The date when the fine was paid
 */
const updateFine = async (fineId, paid, payment_date) => {
  const connection = await db.createConnectionPool();

  const query = "UPDATE fines SET paid = ?, payment_date = ? WHERE fine_id = ?";
  const [updatedFine] = await connection.execute(query, [
    paid,
    payment_date,
    fineId
  ]);

  await db.closeConnectionPool();

  return updatedFine;
};

/**
 * deleteFine
 * @param {number} fineId - The ID of the fine to be deleted
 */
const deleteFine = async (fineId) => {
  const connection = await db.createConnectionPool();

  const query = "DELETE FROM fines WHERE fine_id = ?";
  const [deletedFine] = await connection.execute(query, [fineId]);

  await db.closeConnectionPool();

  return deletedFine;
};

/**
 * getFineById
 *
 * @param {number} fineId - The ID of the fine
 * @param {object} filterBy - The filter by object
 * @returns {Promise<object>} The fine
 */
const getFineById = async (fineId) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM fines WHERE fine_id = ?";
  const [fine] = await connection.execute(query, [fineId]);

  await db.closeConnectionPool();

  return fine;
};

/**
 * getAllFines
 * @returns {Promise<object>} The all fines
 */
const getAllFines = async () => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM fines";
  const [fines] = await connection.execute(query);

  await db.closeConnectionPool();

  return fines;
};

/**
 * getFineByUserId
 * @param {number} userId - The ID of the user
 * @param {object} filterBy - The filter by object
 * @param {boolean} [filterBy.paid] - Whether the fine is paid
 * @param {string} [filterBy.dueDate] - The due date of the fine
 * @param {number} [filterBy.bookId] - The ID of the book
 * @returns {Promise<object>} The fine
 */
const getFineByUserId = async (userId, filterBy) => {
  const connection = await db.createConnectionPool();

  let query = "SELECT * FROM fines WHERE fk_user_id = ?";
  const params = [userId];

  if (filterBy?.paid !== undefined) {
    query += " AND paid = ?";
    params.push(filterBy.paid);
  }

  if (filterBy?.dueDate) {
    query += " AND DATE(due_date) = ?";
    params.push(filterBy.dueDate);
  }
  if (filterBy?.bookId) {
    query += " AND fk_book_id = ?";
    params.push(filterBy.bookId);
  }

  const [fines] = await connection.execute(query, params);

  await db.closeConnectionPool();
  return fines;
};

module.exports = {
  getAllFines,
  createFine,
  deleteFine,
  getFineById,
  updateFine,
  getFineByUserId
};
