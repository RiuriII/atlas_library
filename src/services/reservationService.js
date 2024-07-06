const { updateBook, checkBookAvailability } = require("../models/booksModel");
const { getUserById } = require("../models/usersModel");
const { sendEmailNotification } = require("./notificationService");
const {
  searchReservedBooksOverdue,
  updateReservation
} = require("../models/reservationModel");

require("dotenv").config();

/**
 * Updates book status to reserved and notifies user about the reservation.
 *
 * @param {number} userId - The ID of the user making the reservation
 * @param {number} bookId - The ID of the book being reserved
 * @param {number} reservationId - The ID of the reservation
 * @return {Promise<void>} A promise that resolves when the update and notification are complete
 */
const notifyReservationForReturnedBook = async (
  userId,
  bookId,
  reservationId
) => {
  try {
    // The book has reservation, updating status to reserved
    await updateBook(bookId, {
      available: false,
      status: "reserved"
    });
    await updateReservation(reservationId, {
      reservation_expiration_date: new Date()
    });
    const [user] = await getUserById(userId);
    // Notifying the user about the reservation
    await sendEmailNotification(
      user.email,
      "Reservation Book 📗",
      "The book you have reserved has been returned, you can borrow it.",
      "<h1>Your reservation has available for borrow</h1> <br> <p>The book you have reserved has been returned, you can borrow it.</p>"
    );
  } catch (error) {
    console.error(error);
  }
};

/**
 * Verifies if the reservation is overdue and sends an email notification if it is.
 */
const checkOverdueReservation = async () => {
  try {
    console.log("verify reservations");
    const reservations = await searchReservedBooksOverdue(
      Number(process.env.RESERVATION_ACTIVE_TIME_DAYS)
    );

    if (reservations.length >= 1) {
      const usersWithMultipleReservations = {};

      for (const reservation of reservations) {
        const [book] = await checkBookAvailability(reservation.fk_book_id);

        if (reservation.active && book.status === "reserved") {
          if (!usersWithMultipleReservations[reservation.fk_user_id]) {
            usersWithMultipleReservations[reservation.fk_user_id] = [];
          }

          usersWithMultipleReservations[reservation.fk_user_id].push({
            ...reservation,
            book_title: book.title
          });
        }
      }

      for (const userId of Object.keys(usersWithMultipleReservations)) {
        const userReservations = usersWithMultipleReservations[userId];
        for (const reservation of userReservations) {
          await updateReservation(reservation.reservation_id, {
            active: false
          });
          await updateBook(reservation.fk_book_id, {
            available: true,
            status: "available"
          });
        }

        const [user] = await getUserById(userId);
        const reservationBooks = userReservations.map(
          (reservation) => reservation.book_title
        );
        const message =
          userReservations.length > 1
            ? `Books: ${reservationBooks.join(", ")}`
            : `Book: ${reservationBooks[0]}`;

        await sendEmailNotification(
          user.email,
          "The reserved book(s) have expired 📕",
          `Your reservation(s) have expired. The book(s) is/are now available for other users. ${message}`,
          `<h1>The reserved book(s) have expired</h1> <br> <p>Your reservation(s) have expired. The book(s) is/are now available for other users. ${message}</p>`
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  notifyReservationForReturnedBook,
  checkOverdueReservation
};
