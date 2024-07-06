const db = require("./connection");

/**
 * Returns all categories from the database.
 *
 * @return {Promise<Array>} An array of category objects.
 */
const getAll = async () => {
  const connection = await db.createConnectionPool();

  const [categories] = await connection.execute("SELECT * FROM categories");

  await db.closeConnectionPool();

  return categories;
};

/**
 * Creates a new category in the database
 * @param {Object} category The category object to be created
 * @param {string} category.name The name of the category
 * @returns {Promise<Object>} The created category
 */
const createCategory = async (category) => {
  const connection = await db.createConnectionPool();

  const { name } = category;

  const query = `
	INSERT INTO categories(name) 
	VALUES(?)
  `;

  const [createdCategory] = await connection.execute(query, [name]);

  await db.closeConnectionPool();

  return { insertId: createdCategory.insertId };
};

/**
 * Updates a category in the database
 * @param {number} categoryId The ID of the category to be updated
 * @param {Object} updateField The field to be updated
 * @param {string} updateField.name The new name of the category
 * @returns {Promise<Object>} The updated category
 */
const updateCategory = async (categoryId, updateField) => {
  const connection = await db.createConnectionPool();

  const { name } = updateField;

  const query = `UPDATE categories SET name = ? WHERE category_id = ?`;
  const values = [name, categoryId];

  const [updatedCategory] = await connection.execute(query, values);

  await db.closeConnectionPool();

  return updatedCategory;
};

/**
 * Deletes a category from the database
 * @param {number} categoryId The ID of the category to be deleted
 * @returns {Promise<Object>} The deleted category
 */
const deleteCategory = async (categoryId) => {
  const connection = await db.createConnectionPool();

  const query = "DELETE FROM categories WHERE category_id = ?";

  const [deletedCategory] = await connection.execute(query, [categoryId]);

  await db.closeConnectionPool();

  return deletedCategory;
};

/**
 * Returns a category from the database based on its ID
 * @param {number} categoryId The ID of the category
 * @returns {Promise<Object>} The category
 */
const getCategoryById = async (categoryId) => {
  const connection = await db.createConnectionPool();

  const query = "SELECT * FROM categories WHERE category_id = ?";

  const [category] = await connection.execute(query, [categoryId]);

  await db.closeConnectionPool();

  return category;
};

module.exports = {
  getAll,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
};
