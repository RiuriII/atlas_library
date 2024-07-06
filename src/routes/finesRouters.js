const express = require("express");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const finesController = require("../controllers/finesController");
const finesMiddlewares = require("../middlewares/finesMiddlewares");
const { BadRequestError } = require("../utils/apiError");

const router = express.Router();

router.post(
  "/fine",
  finesMiddlewares.validateRequiredBodyFine,
  finesController.createFine
);

router.delete(
  "/fine/:fineId",
  genericMiddlewares.validateParamId.bind(null, "fineId"),
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

router.get("/fines", finesController.getAllFines);

router.patch(
  "/fine/:fineId/paidFine",
  genericMiddlewares.validateParamId.bind(null, "fineId"),
  finesMiddlewares.validateReturnedBodyFine,
  finesController.paidFine
);

router.patch("/fine/?/paidFine", (_req, _res) => {
  throw new BadRequestError("Missing 'fineId' parameter in the query");
});

router.delete("/fine", (_req, _res) => {
  throw new BadRequestError("Missing 'fineId' parameter in the query");
});

module.exports = router;
