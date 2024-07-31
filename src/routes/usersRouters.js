const express = require("express");

const router = express.Router();

const usersController = require("../controllers/usersController");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const authMiddlewares = require("../middlewares/authMiddlewares");
const authController = require("../controllers/authController");
const { BadRequestError } = require("../utils/apiError");

const fields = ["name", "whatsapp", "number", "email", "password", "role"];

router.get(
  "/users",
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin"]),
  usersController.getAll
);

router.post(
  "/user",
  genericMiddlewares.validateBodyRequiredFields.bind(null, fields),
  usersController.createUser
);

router.delete(
  "/user/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin"]),
  usersController.deleteUser
);

router.delete("/user", (_req, _res) => {
  throw new BadRequestError("Missing 'userId' parameter in the query");
});

router.get(
  "/user/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  authMiddlewares.verifyToken,
  usersController.getUserById
);

router.get("/user", (_req, _res) => {
  throw new BadRequestError("Missing 'userId' parameter in the query");
});

router.patch(
  "/user/update/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  genericMiddlewares.validateBodyUpdatedFields.bind(null, fields),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "user"]),
  usersController.updateUser
);

router.patch("/user/update", (_req, _res) => {
  throw new BadRequestError("Missing 'userId' parameter in the query");
});

router.post(
  "/user/login",
  genericMiddlewares.validateBodyUpdatedFields.bind(null, fields),
  authController.login
);

module.exports = router;
