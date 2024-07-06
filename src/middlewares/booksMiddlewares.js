const { ConflictError, BadRequestError } = require("../utils/apiError");

/**
 * Validates the required fields in the request body.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} _res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @throws {BadRequestError} If the request body is missing or required fields is empty.
 * @throws {ConflictError} If the status field is not valid.
 */
const validateBookBodyRequiredFields = (req, _res, next) => {
  const requiredFields = [
    "title",
    "publication_year",
    "available",
    "status",
    "rating",
    "quantity",
    "description",
    "authorId",
    "categoryId"
  ];

  const statusFields = ["available", "reserved", "borrowed"];

  const { body } = req;

  const bodyKeys = Object.keys(body);

  if (bodyKeys.length == 0) {
    throw new BadRequestError(
      `Missing request body. Please provide the necessary data in the request body`
    );
  }

  for (let index = 0; index < bodyKeys.length; index++) {
    if (
      !(
        bodyKeys.includes(requiredFields[index]) &&
        String(body[requiredFields[index]]).trim().length >= 1
      )
    ) {
      throw new BadRequestError(
        `Field '${requiredFields[index]}' is required and cannot be empty`
      );
    }
  }

  if (!statusFields.includes(body.status)) {
    throw new ConflictError(
      `Field 'status' must be 'available','reserved' or'borrowed'`
    );
  }

  next();
};

/**
 * Verifies if any fields are empty in the request body during an update.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
const validateBookBodyUpdatedFields = (req, _res, next) => {
  const allowedFields = [
    "title",
    "publication_year",
    "available",
    "status",
    "rating",
    "quantity",
    "description",
    "authorId",
    "categoryId"
  ];

  const statusFields = ["available", "reserved", "borrowed"];

  const updateFields = req.body;

  if (Object.keys(updateFields).length === 0) {
    throw new BadRequestError("Body request can not be empty");
  }

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

  if (updateFields.status && !statusFields.includes(updateFields.status)) {
    throw new ConflictError(
      `Field 'status' must be 'available','reserved' or'borrowed'`
    );
  }

  next();
};

module.exports = {
  validateBookBodyRequiredFields,
  validateBookBodyUpdatedFields
};
