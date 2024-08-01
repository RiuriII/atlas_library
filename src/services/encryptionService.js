const bcrypt = require("bcrypt");

/**
 * Encrypts a password
 * @param {String} password
 * @returns {Promise<String>} The encrypted password
 */
const encrypt = async (password) => {
  // Generate a salt (random value)
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  // Hash the password with the salt
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

/**
 * Compares a password with a hashed password
 * @param {String} password
 * @param {String} hashedPassword
 * @returns {Promise<Boolean>} True if the password matches the hashed password
 */
const comparePasswords = async (password, hashedPassword) => {
  // Compare the provided password with the stored hash
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
};

module.exports = {
  encrypt,
  comparePasswords
};
