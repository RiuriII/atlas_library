const express = require("express");

const router = express.Router();

const authorsController = require("../controllers/authorsController");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const { BadRequestError } = require("../utils/apiError");
const authMiddlewares = require("../middlewares/authMiddlewares");

const fields = ["name", "about"];

router.get(
  "/authors",
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  authorsController.getAll
);

router.post(
  "/author",
  genericMiddlewares.validateBodyRequiredFields.bind(null, fields),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  authorsController.createAuthor
);

router.delete(
  "/author/:authorId",
  genericMiddlewares.validateParamId.bind(null, "authorId"),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  authorsController.deleteAuthor
);

router.delete("/author", (_req, _res) => {
  throw new BadRequestError("Missing 'authorId' parameter in the query");
});

router.get(
  "/author/:authorId",
  genericMiddlewares.validateParamId.bind(null, "authorId"),
  authorsController.getAuthorById
);

router.get("/author", (_req, _res) => {
  throw new BadRequestError("Missing 'authorId' parameter in the query");
});

router.patch(
  "/author/update/:authorId",
  genericMiddlewares.validateParamId.bind(null, "authorId"),
  genericMiddlewares.validateBodyUpdatedFields.bind(null, fields),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  authorsController.updateAuthor
);

module.exports = router;
