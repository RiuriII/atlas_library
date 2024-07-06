const { checkBookAvailability, updateBook } = require("../models/booksModel");
const { getUserById } = require("../models/usersModel");
const { NotFoundError, ConflictError } = require("../utils/apiError");
const loanModel = require("../models/loanModel");
const {
  checkUserActiveReservationForBook,
  updateReservation,
  checkBookHasReservation
} = require("../models/reservationModel");
const {
  notifyReservationForReturnedBook
} = require("../services/reservationService");

require("dotenv");

const createLoan = async (req, res) => {
  const { bookId, userId } = req.body;

  const [availabilityBook] = await checkBookAvailability(bookId);
  const [user] = await getUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found, check the id and try again");
  }

  const [isActiveReservation] = await checkUserActiveReservationForBook(
    userId,
    bookId
  );

  if (
    availabilityBook.available ||
    (isActiveReservation && availabilityBook.status === "reserved")
  ) {
    const LoanExists = await loanModel.getUserLoansById(userId);

    const LoanAlreadyExists = LoanExists.filter(
      (loan) => loan.fk_book_id === bookId && loan.returned === false
    );

    if (LoanAlreadyExists.length > 0) {
      throw new ConflictError("Loan already exists");
    }

    const dateLoan = new Date();
    const dateReturnLoan = new Date(dateLoan);
    dateReturnLoan.setDate(
      dateLoan.getDate() + Number(process.env.RETURN_INTERVAL_DAYS)
    );

    // Book available for Loan, proceed with the Loan
    const createdLoan = await loanModel.createLoan({
      bookId,
      userId,
      dateLoan,
      dateReturnLoan
    });

    // updated status of book
    await updateBook(bookId, {
      available: false,
      status: "borrowed"
    });

    if (isActiveReservation) {
      await updateReservation(isActiveReservation.reservation_id, {
        active: false
      });
    }

    return res.status(201).json(createdLoan);
  } else {
    // Book not available for Loan
    throw new ConflictError(
      `Book is not available for Loan, status: ${availabilityBook.status}`
    );
  }
};

const getAllLoans = async (_req, res) => {
  const loans = await loanModel.getAllLoans();
  return res.status(200).json(loans);
};

const deleteLoan = async (req, res) => {
  const { loanId } = req.params;

  const loan = await loanModel.deleteLoan(loanId);

  if (loan.affectedRows === 0) {
    throw new NotFoundError("Loan not found, check the id and try again");
  }

  return res.status(204).json();
};

const updateLoanReturnStatus = async (req, res) => {
  const { loanId } = req.params;
  const { returned } = req.body;

  const updatedLoan = await loanModel.updateLoan(loanId, { returned });

  if (updatedLoan.changedRows === 0 && updatedLoan.affectedRows === 0) {
    throw new NotFoundError("Loan not found, check id and try again");
  }

  if (updatedLoan.changedRows === 0 && updatedLoan.affectedRows >= 1) {
    throw new ConflictError("Loan found, but info for updated has duplicate");
  }

  const [loan] = await loanModel.getLoanById(loanId);

  const [loansWithActivesReservations] = await checkBookHasReservation(
    loan.fk_book_id
  );

  if (loansWithActivesReservations) {
    notifyReservationForReturnedBook(
      loansWithActivesReservations.fk_user_id,
      loansWithActivesReservations.fk_book_id,
      loansWithActivesReservations.reservation_id
    );
  } else {
    await updateBook(loan.fk_book_id, {
      available: returned,
      status: "available"
    });
  }

  return res.status(204).json();
};

const getUserLoansById = async (req, res) => {
  const { userId } = req.params;

  const loan = await loanModel.getUserLoansById(userId);

  if (loan.length == 0) {
    throw new NotFoundError("User don't have Loan, check the id and try again");
  }

  return res.status(200).json(loan);
};

const getLoanById = async (req, res) => {
  const { loanId } = req.params;

  const loan = await loanModel.getLoanById(loanId);

  if (loan.length == 0) {
    throw new NotFoundError("Loan not found, check the id and try again");
  }

  return res.status(200).json(loan);
};

const extendLoanReturnDate = async (req, res) => {
  const { loanId } = req.params;

  const [loan] = await loanModel.getLoanById(loanId);

  const loan_date = new Date(loan.loan_date);
  loan_date.setDate(
    loan_date.getDate() + Number(process.env.RETURN_INTERVAL_DAYS)
  );

  const isExtended =
    loan_date.getTime() !== new Date(loan.return_date).getTime();

  if (isExtended) {
    throw new ConflictError(
      "Loan extension is not allowed as it has already been extended."
    );
  }

  const dateReturnLoan = new Date(loan.return_date);
  dateReturnLoan.setDate(
    dateReturnLoan.getDate() + Number(process.env.RETURN_INTERVAL_DAYS)
  );

  if (loan.length == 0) {
    throw new NotFoundError("Loan not found, check the id and try again");
  }

  // updated status of loan
  await loanModel.updateLoan(loanId, { return_date: dateReturnLoan });

  return res.status(200).json({ extendedReturnDate: dateReturnLoan });
};

module.exports = {
  createLoan,
  deleteLoan,
  updateLoanReturnStatus,
  getUserLoansById,
  extendLoanReturnDate,
  getAllLoans,
  getLoanById
};
