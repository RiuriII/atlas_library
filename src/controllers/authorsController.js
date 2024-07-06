const authorsModel = require("../models/authorsModel");
const { NotFoundError, ConflictError } = require("../utils/apiError");

const getAll = async (_req, res) => {
  const authors = await authorsModel.getAll();
  return res.status(200).json(authors);
};

const createAuthor = async (req, res) => {
  const createdAuthor = await authorsModel.createAuthor(req.body);
  return res.status(201).json(createdAuthor);
};

const deleteAuthor = async (req, res) => {
  const { authorId } = req.params;

  const author = await authorsModel.deleteAuthor(authorId);

  if (author.affectedRows === 0) {
    throw new NotFoundError("author not found, check the id and try again");
  }

  return res.status(204).json();
};

const updateAuthor = async (req, res) => {
  const { authorId } = req.params;

  const updatedAuthor = await authorsModel.updateAuthor(authorId, req.body);

  if (updatedAuthor.changedRows === 0 && updatedAuthor.affectedRows === 0) {
    throw new NotFoundError("Author not found, check id and try again");
  }

  if (updatedAuthor.changedRows === 0 && updatedAuthor.affectedRows >= 1) {
    throw new ConflictError("Author found, but info for updated has duplicate");
  }

  return res.status(204).json();
};

const getAuthorById = async (req, res) => {
  const { authorId } = req.params;

  const author = await authorsModel.getAuthorById(authorId);

  if (author.length == 0) {
    throw new NotFoundError("author not found, check the id and try again");
  }

  return res.status(200).json(author);
};

module.exports = {
  getAll,
  createAuthor,
  deleteAuthor,
  getAuthorById,
  updateAuthor
};
