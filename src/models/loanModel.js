const db = require("./connection");

/**
 * Creates a new loan in the database.
 *
 * @param {{
 *   bookId: number,
 *   userId: number,
 *   dateLoan: Date,
 *   dateReturnLoan: Date
 * }} loanData - The data needed to create a new loan, including the book ID, user ID, loan date, and return date.
 * @returns {{ insertId: number }} The ID of the newly created loan.
 */
const createLoan = async ({ bookId, userId, dateLoan, dateReturnLoan }) => {
  const connection = await db.createConnectionPool();

  const query =
    "INSERT INTO loans(loan_date, return_date, returned, fk_book_id, fk_user_id) VALUES(?,?,?,?,?)";

  const [createdLoan] = await connection.execute(query, [
    dateLoan,
    dateReturnLoan,
    false,
    bookId,
    userId
  ]);

  await db.closeConnectionPool();

  return { insertId: createdLoan.insertId };
};

/**
 * get all loans from the database
 * @returns {Promise<Array>} An array of loan objects
 */
const getAllLoans = async () => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM loans";
  const [loans] = await connection.execute(query);

  await db.closeConnectionPool();

  return loans;
};

/**
 * Updates an existing loan in the database.
 *
 * @param {number} loanId - The ID of the loan to update.
 * @param {object} updateFields - The fields to update.
 * @param {Date} [updateFields.loan_date] - The new loan date.
 * @param {Date} [updateFields.return_date] - The new return date.
 * @param {boolean} [updateFields.returned] - The new returned status.
 * @param {number} [updateFields.book_id] - The new book ID.
 * @param {number} [updateFields.user_id] - The new user ID.
 * @returns  Empty on success.
 */
const updateLoan = async (loanId, updateFields) => {
  const connection = await db.createConnectionPool();

  const updateKeys = Object.keys(updateFields);
  const updateValues = Object.values(updateFields);

  const fkMapping = {
    bookId: "fk_book_id",
    userId: "fk_user_id"
  };

  updateKeys.forEach((key, index) => {
    if (fkMapping[key]) {
      updateKeys[index] = fkMapping[key];
    }
  });

  const updateQuery = updateKeys.map((key) => `${key} = ?`).join(", ");

  const query = `UPDATE loans SET ${updateQuery} WHERE loan_id = ?`;
  const values = [...updateValues, loanId];

  const [updatedLoan] = await connection.execute(query, values);

  await db.closeConnectionPool();

  return updatedLoan;
};

/**
 * Delete an existing loan from the database.
 *
 * @param {number} loanId - The ID of the loan to delete.
 * @returns  Return empty in case of success.
 */
const deleteLoan = async (loanId) => {
  const connection = await db.createConnectionPool();

  const query = "DELETE FROM loans WHERE loan_id = ?";

  const [deletedLoan] = await connection.execute(query, [loanId]);

  await db.closeConnectionPool();

  return deletedLoan;
};

/**
 * Gets a list of loans for a specific user.
 *
 * @param {number} userId - The ID of the user.
 * @param {{
 *   returnedOnly: boolean,
 *   date: Date
 * }} [options] - Optional parameters for filtering the results.
 * @param {boolean} [options.returnedOnly] - If true, returns only loans that have been returned.
 * @param {Date} [options.date] - If specified, returns only loans that match the specified date.
 * @returns {Promise<Array>} An array of loan objects, including the loan ID, book ID, user ID, loan date, and return date.
 */
const getUserLoansById = async (userId, options = {}) => {
  const connection = await db.createConnectionPool();

  const { returnedOnly, date } = options;

  let query = "SELECT * FROM loans WHERE fk_user_id = ?";
  const params = [userId];

  if (returnedOnly !== undefined) {
    query += " AND returned = ?";
    params.push(returnedOnly);
  }

  if (date) {
    query += " AND DATE(loan_date) = DATE(?)";
    params.push(date);
  }

  const [userLoans] = await connection.execute(query, params);

  await db.closeConnectionPool();

  return userLoans;
};

/**
 * Gets details for a specific loan.
 *
 * @param {number} loanId - The ID of the loan.
 * @returns {Promise<Array>} An array containing the loan details.
 */
const getLoanById = async (loanId) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM loans WHERE loan_id = ?";

  const [loan] = await connection.execute(query, [loanId]);

  await db.closeConnectionPool();

  return loan;
};

/**
 * Searches for overdue loans.
 *
 * @returns {Promise<Array>} An array of loan objects, including the loan ID, book ID, and user ID.
 */
const searchOverdueBooks = async () => {
  const connection = await db.createConnectionPool();

  const query =
    "SELECT  * FROM loans WHERE returned = false AND return_date < NOW()";

  const [overdueBooks] = await connection.execute(query);

  await db.closeConnectionPool();

  return overdueBooks;
};

/**
 * Searches for returned loans with associated reservations.
 *
 * The search is performed through a join between the loans and reservations tables.
 *
 * @param {{
 *   userId: number,
 *   date: Date,
 *   bookId: number,
 * }} [options] - Optional parameters for filtering the results.
 * @param {number} [options.userId] - If specified, returns only loans that were returned by the specified user and have associated reservations.
 * @param {Date} [options.date] - If specified, returns only loans that have reservations for the specified date.
 * @param {number} [options.bookId] - If specified. returns only loan that have reservations for the specified book.
 * @returns {Promise<Array>} An array of loan objects with associated reservations, including the loan ID, book ID, and user ID.
 */
const searchReturnedBooksWithReservations = async (options = {}) => {
  const connection = await db.createConnectionPool();

  const { userId, date, bookId } = options;

  let query = `
    SELECT *
    FROM reservations
    WHERE EXISTS (
      SELECT 1
      FROM loans
      WHERE loans.returned = true
        AND loans.fk_book_id = reservations.fk_book_id
    )`;

  const params = [];

  if (userId) {
    query += " AND fk_user_id = ?";
    params.push(userId);
  }

  if (bookId) {
    query += " AND fk_book_id = ?";
    params.push(bookId);
  }

  if (date) {
    query += " AND DATE(reservation_date) = DATE(?)";
    params.push(date);
  }

  const [returnedBooks] =
    params.length > 0
      ? await connection.execute(query, params)
      : await connection.execute(query);

  await db.closeConnectionPool();

  return returnedBooks;
};

module.exports = {
  createLoan,
  updateLoan,
  deleteLoan,
  getUserLoansById,
  getLoanById,
  searchOverdueBooks,
  searchReturnedBooksWithReservations,
  getAllLoans
};
