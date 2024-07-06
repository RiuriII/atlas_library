const db = require("./connection");

/**
 * Creates a reservation in the database using the provided reservation data.
 *
 * @param {Object} reservation_data - The data for the reservation
 * @param {Date} reservation_data.reservation_date - The data for the reservation
 * @param {Number} reservation_data.bookId - The book ID of the reservation
 * @param {Number} reservation_data.userId - The user ID of the reservation
 * @return {Object} An object containing the insert ID of the created reservation
 */
const createReservation = async (reservation_data) => {
  const connection = await db.createConnectionPool();

  const { reservation_date, bookId, userId } = reservation_data;

  const query = `
			INSERT INTO reservations(reservation_date, active, fk_book_id, fk_user_id) 
			VALUES(?,?,?,?)`;

  const [createdReservation] = await connection.execute(query, [
    reservation_date,
    true,
    bookId,
    userId
  ]);

  await db.closeConnectionPool();

  return { insertId: createdReservation.insertId };
};

const getAllReservations = async () => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM reservations";

  const [reservations] = await connection.execute(query);

  await db.closeConnectionPool();

  return reservations;
};

/**
 * Updates a reservation in the database using the provided reservation data.
 *
 * @param {Number} reservationId - The ID of the reservation to be updated
 * @param {Object} updateFields - The fields to be updated, including the bookId and userId
 * @returns
 */
const updateReservation = async (reservationId, updateFields) => {
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

  const query = `UPDATE reservations SET ${updateQuery} WHERE reservation_id = ?`;
  const values = [...updateValues, reservationId];

  const [updatedReservation] = await connection.execute(query, values);

  await db.closeConnectionPool();

  return updatedReservation;
};

/**
 * Deletes a reservation from the database.
 *
 * @param {Number} reservationId - The ID of the reservation to be deleted
 */
const deleteReservation = async (reservationId) => {
  const connection = await db.createConnectionPool();

  const query = "DELETE FROM reservations WHERE reservation_id = ?";

  const [deletedReserve] = await connection.execute(query, [reservationId]);

  await db.closeConnectionPool();

  return deletedReserve;
};

/**
 * Returns a reservation from the database based on its ID
 * @param {Number} userId - The ID of user for which the reservation will be returned
 * @returns {Promise<Object>} The reservation promise object
 */
const getUserReservationsByUserId = async (userId) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM reservations WHERE fk_user_id = ?";

  const [reservation] = await connection.execute(query, [userId]);

  await db.closeConnectionPool();

  return reservation;
};

/**
 * Retrieves a reservation from the database based on its ID.
 *
 * @param {number} reservationId - The ID of the reservation to retrieve.
 * @return {Promise<Object>} A promise that resolves to the reservation object.
 */
const getReservationById = async (reservationId) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM reservations WHERE reservation_id = ?";
  const [reservation] = await connection.execute(query, [reservationId]);

  await db.closeConnectionPool();

  return reservation;
};

/**
 * Returns a reservation book overdue from the database.
 * @param {Number} date_interval - The parameter for get overdue books
 * @returns {Promise<Object>} The reservation promise object
 */
const searchReservedBooksOverdue = async (date_interval) => {
  const connection = await db.createConnectionPool();

  const query =
    "SELECT * FROM reservations WHERE NOW() > DATE_ADD(reservation_expiration_date, INTERVAL ? DAY) AND active = true";

  const [reservedBooksOverdue] = await connection.execute(query, [
    date_interval
  ]);

  await db.closeConnectionPool();

  return reservedBooksOverdue;
};

/**
 * checks if a user has an active reservation
 *
 * @param {Number} userId - The user ID of the reservation
 * @param {Number} bookId - The book ID of the reservation
 * @returns {Promise<Object>} The active reservation
 */
const checkUserActiveReservationForBook = async (userId, bookId) => {
  const connection = await db.createConnectionPool();

  const query = `SELECT * FROM reservations WHERE fk_user_id = ? AND fk_book_id = ? AND active = true`;
  const [reservation] = await connection.execute(query, [userId, bookId]);

  await db.closeConnectionPool();

  return reservation;
};

/**
 * Checks if a book has an active reservation
 *
 * @param {Number} bookId - The book ID of the reservation
 * @returns {Promise<Object>} The active reservation
 */
const checkBookHasReservation = async (bookId) => {
  const connection = await db.createConnectionPool();

  const query = `SELECT * FROM reservations WHERE fk_book_id = ? AND active = true`;
  const [reservation] = await connection.execute(query, [bookId]);

  await db.closeConnectionPool();

  return reservation;
};

module.exports = {
  createReservation,
  updateReservation,
  deleteReservation,
  getUserReservationsByUserId,
  searchReservedBooksOverdue,
  checkUserActiveReservationForBook,
  checkBookHasReservation,
  getAllReservations,
  getReservationById
};
