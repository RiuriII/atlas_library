const { BadRequestError } = require("../utils/apiError");

/**
 * Verifies if any fields are empty in the request body during an update.
 * @param {string[]} fields - The list of allowed fields.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
const validateReturnedBodyLoan = (req, _res, next) => {
  const allowedField = "returned";

  const updateFields = req.body;

  if (Object.keys(updateFields).length === 0) {
    throw new BadRequestError("Body request can not be empty");
  }

  // Verifies if any fields are empty
  const emptyFields = Object.keys(updateFields).filter(
    (field) =>
      updateFields[field] == null ||
      (typeof updateFields[field] === "string" &&
        updateFields[field].toString().trim() === "")
  );

  // Verifies if all provided fields are in the allowed list
  const invalidFields = Object.keys(updateFields).filter(
    (field) => !allowedField.includes(field)
  );

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

  if (!updateFields.returned) {
    throw new BadRequestError("Returned field can not be false");
  }

  next();
};

module.exports = {
  validateReturnedBodyLoan
};
