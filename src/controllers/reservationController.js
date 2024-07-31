const { checkBookAvailability } = require("../models/booksModel");
const { ConflictError, NotFoundError } = require("../utils/apiError");
const reservationModel = require("../models/reservationModel");
const loanModel = require("../models/loanModel");

const createReservation = async (req, res) => {
  const { bookId, userId } = req.body;

  const [availabilityBook] = await checkBookAvailability(bookId);

  if (!availabilityBook.available) {
    const reservationExists =
      await reservationModel.checkBookHasReservation(bookId);

    if (reservationExists.length > 0) {
      throw new ConflictError("Reservation already exists");
    }

    // Anyone who borrows a book cannot reserve the same book.
    const LoanExist = await loanModel.getUserLoansById(userId);

    const LoanAlreadyExists = LoanExist.filter(
      (loan) => loan.fk_book_id == bookId && loan.returned == false
    );

    if (LoanAlreadyExists.length > 0) {
      throw new ConflictError(
        "You have already borrowed this book, so you cannot reserve it"
      );
    }

    const reservation_date = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Book is available for reservation, proceed with the reservation
    const createdReservation = await reservationModel.createReservation({
      bookId,
      userId,
      reservation_date
    });

    return res.status(201).json(createdReservation);
  } else {
    // Book is not available for reservation
    throw new ConflictError(
      `Book unavailable, status: ${availabilityBook.status}`
    );
  }
};

const getAllReservations = async (_req, res) => {
  const reservations = await reservationModel.getAllReservations();
  return res.status(200).json(reservations);
};

const deleteReservation = async (req, res) => {
  const { reservationId } = req.params;

  const reservation = await reservationModel.deleteReservation(reservationId);
  if (reservation.affectedRows === 0) {
    throw new NotFoundError(
      "Reservation not found, check the id and try again"
    );
  }
  return res.status(204).json();
};

const updateReservation = async (req, res) => {
  const { reservationId } = req.params;

  const updatedReservation = await reservationModel.updateReservation(
    reservationId,
    req.body
  );

  if (
    updatedReservation.changedRows === 0 &&
    updatedReservation.affectedRows === 0
  ) {
    throw new NotFoundError(
      "Reservation not found, check the id and try again"
    );
  }

  if (
    updatedReservation.changedRows === 0 &&
    updatedReservation.affectedRows >= 1
  ) {
    throw new ConflictError(
      "Reservation found, but info for updated has duplicate"
    );
  }

  return res.status(204).json();
};

const getUserReservationsByUserId = async (req, res) => {
  const { userId } = req.params;

  const reservation =
    await reservationModel.getUserReservationsByUserId(userId);

  if (reservation.length == 0) {
    throw new NotFoundError(
      "User don't have reservation, check the id and try again"
    );
  }

  return res.status(200).json(reservation);
};

const getReservationById = async (req, res) => {
  const { reservationId } = req.params;
  const reservation = await reservationModel.getReservationById(reservationId);

  if (reservation.length == 0) {
    throw new NotFoundError(
      "REServation not found, check the id and try again"
    );
  }

  return res.status(200).json(reservation);
};

module.exports = {
  createReservation,
  deleteReservation,
  updateReservation,
  getUserReservationsByUserId,
  getAllReservations,
  getReservationById
};
