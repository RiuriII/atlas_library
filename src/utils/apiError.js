class ApiError extends Error {
  statusCode;
  details;

  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

class BadRequestError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

class ConflictError extends ApiError {
  constructor(message, details = null) {
    super(message, 409, details);
  }
}

class NotFoundError extends ApiError {
  constructor(message, details = null) {
    super(message, 404, details);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message, details = null) {
    super(message, 401, details);
  }
}

module.exports = {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ApiError
};
