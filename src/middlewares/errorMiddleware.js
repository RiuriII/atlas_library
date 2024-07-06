const errorMiddleware = (error, _req, res, next) => {
  const statusCode = error.statusCode ?? 500;
  const message = error.message ? error.message : "Internal Server Error";

  if (res.headersSent) {
    return next(error);
  }

  const responsePayload = {
    message,
    ...(error.details ? { details: error.details } : {})
  };

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorMiddleware;
