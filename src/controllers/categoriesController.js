const categoryModel = require("../models/categoriesModel");
const { NotFoundError, ConflictError } = require("../utils/apiError");

const getAll = async (_req, res) => {
  const category = await categoryModel.getAll();
  return res.status(200).json(category);
};

const createCategory = async (req, res) => {
  const createdCategory = await categoryModel.createCategory(req.body);

  return res.status(201).json(createdCategory);
};

const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  const category = await categoryModel.deleteCategory(categoryId);
  if (category.affectedRows === 0) {
    throw new NotFoundError("author not found, check the id and try again");
  }
  return res.status(204).json();
};

const updateCategory = async (req, res) => {
  const { categoryId } = req.params;

  const updatedCategory = await categoryModel.updateCategory(
    categoryId,
    req.body
  );

  if (updatedCategory.changedRows === 0 && updatedCategory.affectedRows === 0) {
    throw new NotFoundError("Category not found, check the id and try again");
  }

  if (updatedCategory.changedRows === 0 && updatedCategory.affectedRows >= 1) {
    throw new ConflictError(
      "Category found, but info for updated has duplicate"
    );
  }

  return res.status(204).json();
};

const getCategoryById = async (req, res) => {
  const { categoryId } = req.params;

  const category = await categoryModel.getCategoryById(categoryId);

  if (category.length == 0) {
    throw new NotFoundError("Category not found, check the id and try again");
  }

  return res.status(200).json(category);
};

module.exports = {
  getAll,
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory
};
