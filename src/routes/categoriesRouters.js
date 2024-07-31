const express = require("express");

const router = express.Router();

const categoriesController = require("../controllers/categoriesController");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const { BadRequestError } = require("../utils/apiError");
const authMiddlewares = require("../middlewares/authMiddlewares");

const fields = ["name"];

router.get(
  "/categories",
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  categoriesController.getAll
);

router.post(
  "/category",
  genericMiddlewares.validateBodyRequiredFields.bind(null, fields),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  categoriesController.createCategory
);

router.delete(
  "/category/:categoryId",
  genericMiddlewares.validateParamId.bind(null, "categoryId"),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  categoriesController.deleteCategory
);

router.delete("/category", (_req, _res) => {
  throw new BadRequestError("Missing 'categoryId' parameter in the query");
});

router.get(
  "/category/:categoryId",
  genericMiddlewares.validateParamId.bind(null, "categoryId"),
  categoriesController.getCategoryById
);

router.get("/category", (_req, _res) => {
  throw new BadRequestError("Missing 'categoryId' parameter in the query");
});

router.patch(
  "/category/update/:categoryId",
  genericMiddlewares.validateParamId.bind(null, "categoryId"),
  genericMiddlewares.validateBodyRequiredFields.bind(null, fields),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  categoriesController.updateCategory
);

module.exports = router;
