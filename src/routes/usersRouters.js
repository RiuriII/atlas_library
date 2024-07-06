const express = require("express");

const router = express.Router();

const usersController = require("../controllers/usersController");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const { BadRequestError } = require("../utils/apiError");

const fields = ["name", "whatsapp", "number", "email", "password"];

router.post(
  "/user",
  genericMiddlewares.validateBodyRequiredFields.bind(null, fields),
  usersController.createUser
);

router.delete(
  "/user/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  usersController.deleteUser
);

router.delete("/user", (_req, _res) => {
  throw new BadRequestError("Missing 'userId' parameter in the query");
});

router.get(
  "/user/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  usersController.getUserById
);

router.get("/user", (_req, _res) => {
  throw new BadRequestError("Missing 'userId' parameter in the query");
});
router.get("/user/verify", (_req, _res) => {
  throw new BadRequestError("Missing 'userId' parameter in the query");
});

router.patch(
  "/user/update/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  genericMiddlewares.validateBodyUpdatedFields.bind(null, fields),
  usersController.updateUser
);

router.patch("/user/update", (_req, _res) => {
  throw new BadRequestError("Missing 'userId' parameter in the query");
});

router.get(
  "/user/verify/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  genericMiddlewares.validateBodyUpdatedFields.bind(null, fields),
  usersController.userExists
);

module.exports = router;
