const booksModel = require("../models/booksModel");
const { NotFoundError, ConflictError } = require("../utils/apiError");

const getAll = async (_req, res) => {
  const books = await booksModel.getAll();
  return res.status(200).json(books);
};

const createBook = async (req, res) => {
  try {
    const createdBook = await booksModel.createBook(req.body);

    return res.status(201).json(createdBook);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const errorMessage = error.sqlMessage;
      const fieldName = errorMessage
        .match(/Duplicate entry '[^']+' for key '([^']+)'/)[1]
        .split(".")[1];

      throw new ConflictError("Book already exists", {
        duplicated_field: fieldName
      });
    }
    throw error;
  }
};

const deleteBook = async (req, res) => {
  const { bookId } = req.params;

  const book = await booksModel.deleteBook(bookId);
  if (book.affectedRows === 0) {
    throw new NotFoundError("Book not found, check the id and try again");
  }
  return res.status(204).json();
};

const updateBook = async (req, res) => {
  const { bookId } = req.params;

  const updatedBook = await booksModel.updateBook(bookId, req.body);

  if (updatedBook.changedRows === 0 && updatedBook.affectedRows === 0) {
    throw new NotFoundError("Book not found, check id and try again");
  }

  if (updatedBook.changedRows === 0 && updatedBook.affectedRows >= 1) {
    throw new ConflictError("Book found, but info for updated has duplicate");
  }

  return res.status(204).json();
};

const getBookById = async (req, res) => {
  const { bookId } = req.params;

  const book = await booksModel.getBookById(bookId);

  if (book.length == 0) {
    throw new NotFoundError("Book not found, check the id and try again");
  }

  return res.status(200).json(book);
};

const checkBookAvailability = async (req, res) => {
  const { bookId } = req.params;

  const [book] = await booksModel.checkBookAvailability(bookId);

  if (!book) {
    throw new NotFoundError("Book not found");
  }

  if (!book.available) {
    throw new ConflictError("Book unavailable", {
      title: book.title,
      bookStatus: book.status
    });
  }
  return res.status(200).json({ message: "Book available", book: book });
};

module.exports = {
  getAll,
  createBook,
  deleteBook,
  getBookById,
  updateBook,
  checkBookAvailability
};
