const usersModel = require("../models/usersModel");
const encryption = require("../services/encryptionService");
const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  BadRequestError
} = require("../utils/apiError");

const validateEmailAddress = (email) => {
  const emailRegex = new RegExp("^[^s@,]+@[^s@,]+.[^s@,]{2,}$");
  return emailRegex.test(email);
};

const validatePhoneNumber = (number) => {
  const cleanNumber = number.replace(/\D/g, "");
  const numberRegex = new RegExp("^[0-9]{12,13}$");
  return numberRegex.test(cleanNumber);
};

const createUser = async (req, res) => {
  const user = req.body;
  user.password = await encryption.encrypt(user.password);

  if (!validateEmailAddress(user.email)) {
    throw new BadRequestError(
      "Email invalid, please check the email and try again"
    );
  }

  if (!validatePhoneNumber(user.number)) {
    throw new BadRequestError(
      "Number invalid, please check the number and try again"
    );
  }

  try {
    const createdUser = await usersModel.createUser(user);
    return res.status(201).json(createdUser);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const errorMessage = error.sqlMessage;
      const fieldName = errorMessage
        .match(/Duplicate entry '[^']+' for key '([^']+)'/)[1]
        .split(".")[1];

      throw new ConflictError("User already exists", {
        duplicated_field: fieldName
      });
    }
    throw error;
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  const user = await usersModel.deleteUser(userId);
  if (user.affectedRows === 0) {
    throw new NotFoundError("User not found, check the id and try again");
  }
  return res.status(204).json();
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const body = req.body;

  if (body.email != undefined && !validateEmailAddress(body.email)) {
    throw new BadRequestError(
      "Email invalid, please check the email and try again"
    );
  }

  if (body.number != undefined && !validatePhoneNumber(body.number)) {
    throw new BadRequestError(
      "Number invalid, please check the number and try again"
    );
  }

  const user = await usersModel.updateUser(userId, body);

  if (user.changedRows === 0 && user.affectedRows === 0) {
    throw new NotFoundError("User not found, check id and try again");
  }

  if (user.changedRows === 0 && user.affectedRows >= 1) {
    throw new ConflictError("User found, but info for updated has duplicate");
  }

  return res.status(204).json();
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  const user = await usersModel.getUserById(userId);

  if (user.length == 0) {
    throw new NotFoundError("User not found, check the id and try again");
  }

  return res.status(200).json(user);
};

const userExists = async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;

  const [user] = await usersModel.getUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found, check the id and try again");
  }

  const validPassword = await encryption.comparePasswords(
    password,
    user.password
  );

  if (!validPassword) {
    throw new UnauthorizedError("User password does not match");
  }

  return res
    .status(200)
    .json({ message: "User password matches", userId: user.usuario_id });
};

module.exports = {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
  userExists
};
