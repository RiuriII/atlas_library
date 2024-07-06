const { BadRequestError } = require("../utils/apiError");

/**
 * Verifies if any fields are empty in the request body during an update.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
const validateReturnedBodyFine = (req, _res, next) => {
  const allowedFields = ["paid", "payment_date", "loanId"];

  const updateFields = req.body;

  if (Object.keys(updateFields).length === 0) {
    throw new BadRequestError("Body request can not be empty");
  }

  // Verifies if any fields are empty
  for (const field of allowedFields) {
    if (!(field in req.body)) {
      throw new BadRequestError(`Field '${field}' is required`);
    }
  }

  // Verifica se algum campo no corpo da solicitação está vazio ou nulo
  for (const [field, value] of Object.entries(req.body)) {
    if (value == null || String(value).trim() === "") {
      throw new BadRequestError(`Field '${field}' cannot be empty`);
    }
  }

  // Verifies if all provided fields are in the allowed list
  const invalidFields = Object.keys(updateFields).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new BadRequestError(
      `Invalid fields for update: ${invalidFields.join(", ")}`
    );
  }

  if (!updateFields.paid) {
    throw new BadRequestError("Paid field can not be false");
  }

  next();
};

/**
 * Verifies filter fields in the request body.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
const validateBodyFilterFields = (req, _res, next) => {
  const allowedFields = ["paid", "dueDate"];

  const updateFields = req.body;

  // Verifies if any fields are empty
  const emptyFields = Object.keys(updateFields).filter(
    (field) =>
      updateFields[field] === null ||
      updateFields[field] === undefined ||
      (typeof updateFields[field] === "string" &&
        updateFields[field].toString().trim() === "")
  );

  // Verifies if all provided fields are in the allowed list
  const invalidFields = Object.keys(updateFields).filter(
    (field) => !allowedFields.includes(field)
  );

  // Validate dueDate format
  if (
    updateFields.dueDate &&
    !/^(\d{4})-(\d{2})-(\d{2})$/.test(updateFields.dueDate)
  ) {
    throw new BadRequestError("Invalid format for dueDate. Use YYYY-MM-DD.");
  }

  if (invalidFields.length > 0) {
    throw new BadRequestError(
      `Invalid fields for update: ${invalidFields.join(", ")}`
    );
  }

  if (emptyFields.length > 0) {
    throw new BadRequestError(
      `Fields can not be empty: ${emptyFields.join(", ")}`
    );
  }

  next();
};

/**
 * Verifies if any fields are empty in the request body during a create.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
const validateRequiredBodyFine = (req, _res, next) => {
  const allowedFields = ["userId", "bookId", "loanId"];

  const updateFields = req.body;

  if (Object.keys(updateFields).length === 0) {
    throw new BadRequestError("Body request can not be empty");
  }

  // Verifies if any fields are empty
  for (const field of allowedFields) {
    if (!(field in req.body)) {
      throw new BadRequestError(`Field '${field}' is required`);
    }
  }

  // Verifica se algum campo no corpo da solicitação está vazio ou nulo
  for (const [field, value] of Object.entries(req.body)) {
    if (value == null || String(value).trim() === "") {
      throw new BadRequestError(`Field '${field}' cannot be empty`);
    }
  }

  // Verifies if all provided fields are in the allowed list
  const invalidFields = Object.keys(updateFields).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new BadRequestError(
      `Invalid fields for post: ${invalidFields.join(", ")}`
    );
  }

  next();
};

module.exports = {
  validateReturnedBodyFine,
  validateBodyFilterFields,
  validateRequiredBodyFine
};
