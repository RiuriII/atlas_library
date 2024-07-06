const express = require("express");

const router = express.Router();

const booksController = require("../controllers/booksController");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const booksMiddlewares = require("../middlewares/booksMiddlewares");
const { BadRequestError } = require("../utils/apiError");

router.get("/books", booksController.getAll);

router.post(
  "/book",
  booksMiddlewares.validateBookBodyRequiredFields,
  booksController.createBook
);

router.delete(
  "/book/:bookId",
  genericMiddlewares.validateParamId.bind(null, "bookId"),
  booksController.deleteBook
);

router.delete("/book", (_req, _res) => {
  throw new BadRequestError('Missing "bookId" parameter in the query');
});

router.get(
  "/book/:bookId",
  genericMiddlewares.validateParamId.bind(null, "bookId"),
  booksController.getBookById
);

router.get("/book", (_req, _res) => {
  throw new BadRequestError("Missing 'bookId' parameter in the query");
});

router.patch(
  "/book/:bookId/update",
  genericMiddlewares.validateParamId.bind(null, "bookId"),
  booksMiddlewares.validateBookBodyUpdatedFields,
  booksController.updateBook
);

router.patch("/book/?/update", (_req, _res) => {
  throw new BadRequestError("Missing 'bookId' parameter in the query");
});

router.get(
  "/book/:bookId/availability",
  genericMiddlewares.validateParamId.bind(null, "bookId"),
  booksController.checkBookAvailability
);

router.get("/book/availability", (_req, _res) => {
  throw new BadRequestError("Missing 'bookId' parameter in the query");
});

module.exports = router;
