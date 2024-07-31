const {
  NotFoundError,
  ConflictError,
  BadRequestError
} = require("../utils/apiError");
const { checkBookHasReservation } = require("../models/reservationModel");
const {
  notifyReservationForReturnedBook
} = require("../services/reservationService");
const { updateBook } = require("../models/booksModel");
const loanModel = require("../models/loanModel");
const fineModel = require("../models/finesModel");

const createFine = async (req, res) => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(process.env.RETURN_INTERVAL_DAYS));
  const amount = Number(process.env.FINE_AMOUNT);

  const fine = await fineModel.createFine({ dueDate, amount, ...req.body });

  return res.status(201).json(fine);
};

const deleteFine = async (req, res) => {
  const { fineId } = req.params;
  const deletedFine = await fineModel.deleteFine(fineId);

  if (deletedFine.affectedRows === 0) {
    throw new NotFoundError("Fine not found, check id and try again");
  }
  return res.status(204).json();
};

const paidFine = async (req, res) => {
  const { fineId } = req.params;
  const { paid, payment_date, loanId } = req.body;

  const [loan] = await loanModel.getLoanById(loanId);

  if (loan === undefined) {
    throw new NotFoundError("Loan not found, check id and try again");
  }

  const updatedFine = await fineModel.updateFine(fineId, paid, payment_date);

  if (updatedFine.changedRows === 0 && updatedFine.affectedRows === 0) {
    throw new NotFoundError("Fine not found, check id and try again");
  }

  if (updatedFine.changedRows === 0 && updatedFine.affectedRows >= 1) {
    throw new ConflictError("Fine found, but info for updated has duplicate");
  }

  await loanModel.updateLoan(loanId, { returned: true });

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
      available: true,
      status: "available"
    });
  }

  return res.status(204).json();
};

const getAllFines = async (req, res) => {
  const fines = await fineModel.getAllFines();
  return res.status(200).json(fines);
};

const getFineById = async (req, res) => {
  const { fineId } = req.params;
  const fine = await fineModel.getFineById(fineId);
  if (fine.length === 0) {
    throw new NotFoundError("Fine not found, check id and try again");
  }

  return res.status(200).json(fine);
};

const getFineByUserId = async (req, res) => {
  const { userId } = req.params;
  const filterParams = ["paid", "dueDate", "bookId"];
  const bodyFilterParams = req.body || {};

  for (const param in bodyFilterParams) {
    if (!filterParams.includes(param)) {
      throw new BadRequestError(`Field '${param}' is not allowed`);
    }
  }

  const fines = await fineModel.getFineByUserId(userId, bodyFilterParams);
  if (fines.length === 0) {
    throw new NotFoundError("Fines not found, check id and try again");
  }
  return res.status(200).json(fines);
};

module.exports = {
  createFine,
  paidFine,
  getAllFines,
  getFineById,
  deleteFine,
  getFineByUserId
};
