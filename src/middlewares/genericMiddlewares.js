const { BadRequestError } = require("../utils/apiError");

/**
 * Validates the 'Id' parameter in the query.
 * @param {string} paramName The name of the parameter.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
const validateParamId = (paramName, req, _res, next) => {
  const idParam = req.params[paramName];

  if (idParam === undefined) {
    throw new BadRequestError(`Missing '${paramName}' parameter in the query`);
  }

  const idParamAsNumber = Number(idParam);

  if (isNaN(idParamAsNumber)) {
    throw new BadRequestError(`The '${paramName}' parameter must be a number`);
  }

  next();
};

/**
 * Verifies if any fields are empty in the request body during an update.
 * @param {string[]} fields - The list of allowed fields.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
const validateBodyUpdatedFields = (fields, req, _res, next) => {
  const allowedFields = fields;

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

  next();
};

/**
 * Validates the fields in the request body, ensuring they are not empty.
 * @param {string[]} fields - The list of required fields.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */

const validateBodyRequiredFields = (fields, req, _res, next) => {
  const { body } = req;

  const bodyKeys = Object.keys(body);

  const bodyParams = fields;

  if (bodyKeys.length == 0) {
    throw new BadRequestError(
      `Missing request body. Please provide the necessary data in the request body`
    );
  }

  for (let index = 0; index < bodyKeys.length; index++) {
    if (
      !(
        bodyKeys.includes(bodyParams[index]) &&
        String(body[bodyParams[index]]).trim().length >= 1
      )
    ) {
      throw new BadRequestError(
        `Field '${bodyParams[index]}' is required and cannot be empty`
      );
    }
  }

  next();
};

module.exports = {
  validateParamId,
  validateBodyRequiredFields,
  validateBodyUpdatedFields
};
