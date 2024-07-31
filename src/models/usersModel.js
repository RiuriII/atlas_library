const db = require("./connection");

/**
 * Creates a new user in the database.
 *
 * @param {Object} user - The user object containing the user's information.
 * @param {string} user.name - The name of the user.
 * @param {boolean} user.whatsapp - The user has WhatsApp.
 * @param {string} user.number - The user's phone number.
 * @param {string} user.email - The user's email address.
 * @param {string} user.password - The user's password.
 * @param {string} user.role - The user's role.
 * @return {Object} - An object containing the ID of the newly created user.
 */
const createUser = async (user) => {
  const connection = await db.createConnectionPool();

  const { name, whatsapp, number, email, password, role } = user;

  const query = `
        INSERT INTO users(name, whatsapp, number, email, password, role) 
        VALUES(?,?,?,?,?,?)`;

  const [createdUser] = await connection.execute(query, [
    name,
    whatsapp,
    number,
    email,
    password,
    role
  ]);
  await db.closeConnectionPool();

  return { insertId: createdUser.insertId };
};

/**
 * Updates a user with the given UserId using the provided updateFields.
 *
 * @param {number} UserId - The id of the user to be updated.
 * @param {object} updateFields - An object containing the fields to be updated and their new values.
 * @param {string} [updateFields.name] - The new name of the user.
 * @param {boolean} [updateFields.whatsapp] - The user has WhatsApp.
 * @param {string} [updateFields.number] - The user's phone number.
 * @param {string} [updateFields.email] - The user's email address.
 * @param {string} [updateFields.password] - The user's password.
 * @return {Promise<object>} The updated user object.
 */
const updateUser = async (UserId, updateFields) => {
  const connection = await db.createConnectionPool();

  const updateKeys = Object.keys(updateFields);
  const updateValues = Object.values(updateFields);

  const updateQuery = updateKeys.map((key) => `${key} = ?`).join(", ");

  const query = `UPDATE users SET ${updateQuery} WHERE user_id = ?`;
  const values = [...updateValues, UserId];

  const [updatedUser] = await connection.execute(query, values);

  await db.closeConnectionPool();

  return updatedUser;
};

/**
 * Deletes a user from the database.
 *
 * @param {number} userId - The ID of the user to be deleted.
 * @return {Object} - The deleted user object.
 */
const deleteUser = async (userId) => {
  const connection = await db.createConnectionPool();

  const query = "DELETE FROM users WHERE user_id = ?";

  const [deletedUser] = await connection.execute(query, [userId]);

  await db.closeConnectionPool();

  return deletedUser;
};

/**
 * Retrieves a user by their ID from the database.
 *
 * @param {number} userId - The ID of the user.
 * @return {Promise<Array>} The user object.
 */
const getUserById = async (userId) => {
  const connection = await db.createConnectionPool();

  const query =
    "SELECT user_id, name, whatsapp, number, email, role FROM users WHERE user_id = ?";

  const [User] = await connection.execute(query, [userId]);

  await db.closeConnectionPool();

  return User;
};

/**
 * Checks if a user with the given email exists in the database.
 * @param {string} email - The email address of the user.
 * @return {Promise<Array>} The user object.
 */
const userExist = async (email) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM users WHERE email = ?";

  const [user] = await connection.execute(query, [email]);

  await db.closeConnectionPool();

  return user;
};

/**
 * Retrieves all users from the database.
 * @return {Promise<Array>} The user object.
 */
const getAll = async () => {
  const connection = await db.createConnectionPool();

  const [users] = await connection.execute(
    "SELECT user_id, name, whatsapp, number, email, role FROM users"
  );

  await db.closeConnectionPool();

  return users;
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  userExist,
  getAll
};
