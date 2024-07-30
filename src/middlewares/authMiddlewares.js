const { UnauthorizedError } = require("../utils/apiError");
const jwt = require("jsonwebtoken");

/**
 * Checks if the user is authenticated
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const verifyToken = async (req, _res, next) => {
  const tokenHeader = req.headers["authorization"];

  const token = tokenHeader && tokenHeader.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("User not authenticated");
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET);
    req.user = { role: decode.role };
    next();
  } catch (error) {
    throw new UnauthorizedError("Token invalid");
  }
};

/**
 * Checks if the user has the correct role
 * @param {string[]} roles
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authorize = (roles = [], req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new UnauthorizedError(
      "You do not have permission to access this resource"
    );
  }
  next();
};

module.exports = {
  verifyToken,
  authorize
};
