const usersModel = require("../models/usersModel");
const encryption = require("../services/encryptionService");
const {
  NotFoundError,
  ConflictError,
  BadRequestError
} = require("../utils/apiError");

const validateEmailAddress = (email) => {
  const emailRegex = new RegExp("^[^s@,]+@[^s@,]+.[^s@,]{2,}$");
  return emailRegex.test(email);
};

const validatePhoneNumber = (number) => {
  const cleanNumber = number.replace(/\D/g, "");
  const numberRegex = new RegExp("^[0-9]{10,11}$");
  return numberRegex.test(cleanNumber);
};

const createUser = async (req, res) => {
  const user = req.body;
  const roles = ["admin", "sub-admin", "user"];

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

  if (!roles.includes(user.role)) {
    throw new BadRequestError(
      "Role invalid, please check the role and try again"
    );
  }

  user.password = await encryption.encrypt(user.password);
  const [userExist] = await usersModel.userExist(user.email);

  if (userExist) {
    throw new ConflictError("User already exists");
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

const getAll = async (_req, res) => {
  const users = await usersModel.getAll();
  return res.status(200).json(users);
};

module.exports = {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
  getAll
};
