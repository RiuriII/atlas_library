const express = require("express");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const finesController = require("../controllers/finesController");
const finesMiddlewares = require("../middlewares/finesMiddlewares");
const { BadRequestError } = require("../utils/apiError");
const authMiddlewares = require("../middlewares/authMiddlewares");

const router = express.Router();

router.post(
  "/fine",
  finesMiddlewares.validateRequiredBodyFine,
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  finesController.createFine
);

// remember: verify if user return book with paid fine

router.delete(
  "/fine/:fineId",
  genericMiddlewares.validateParamId.bind(null, "fineId"),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  finesController.deleteFine
);

router.get(
  "/fine/:fineId",
  genericMiddlewares.validateParamId.bind(null, "fineId"),
  finesController.getFineById
);

router.get("/fine", (_req, _res) => {
  throw new BadRequestError("Missing 'fineId' parameter in the query");
});

router.get(
  "/fines",
  finesController.getAllFines,
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"])
);

router.patch(
  "/fine/paidFine/:fineId",
  genericMiddlewares.validateParamId.bind(null, "fineId"),
  finesMiddlewares.validateReturnedBodyFine,
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  finesController.paidFine
);

router.post(
  "/fine/user/:userId",
  finesMiddlewares.validateBodyFilterFields,
  authMiddlewares.verifyToken,
  authMiddlewares.authorize,
  finesController.getFineByUserId
);

router.patch("/fine/paidFine", (_req, _res) => {
  throw new BadRequestError("Missing 'fineId' parameter in the query");
});

router.delete("/fine", (_req, _res) => {
  throw new BadRequestError("Missing 'fineId' parameter in the query");
});

module.exports = router;
