const usersModel = require("../models/usersModel");
const encryption = require("../services/encryptionService");
const jwt = require("jsonwebtoken");
const { NotFoundError, UnauthorizedError } = require("../utils/apiError");

const login = async (req, res) => {
  const { password, email } = req.body;

  const [user] = await usersModel.userExist(email);

  if (!user) {
    throw new NotFoundError("User not found, check the email and try again");
  }

  const validPassword = await encryption.comparePasswords(
    password,
    user.password
  );

  if (!validPassword) {
    throw new UnauthorizedError("User password does not match");
  }
  const SECRET = process.env.SECRET;
  const token = jwt.sign({ name: user.name, role: user.role }, SECRET);

  return res.status(200).json({ message: "User authenticated", token: token });
};

module.exports = {
  login
};
