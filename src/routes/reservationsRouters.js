const express = require("express");

const router = express.Router();

const reservationController = require("../controllers/reservationController");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const { BadRequestError } = require("../utils/apiError");
const fields = ["bookId", "userId", "active"];

router.get("/reservations", reservationController.getAllReservations);

router.post(
  "/reservation",
  genericMiddlewares.validateBodyRequiredFields.bind(null, fields),
  reservationController.createReservation
);

router.delete(
  "/reservation/:reservationId",
  genericMiddlewares.validateParamId.bind(null, "reservationId"),
  reservationController.deleteReservation
);

router.delete("/reservation", (_req, _res) => {
  throw new BadRequestError("Missing 'reservationId' parameter in the query");
});

router.get(
  "/reservation/user/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  reservationController.getUserReservationsByUserId
);

router.get(
  "/reservation/:reservationId",
  genericMiddlewares.validateParamId.bind(null, "reservationId"),
  reservationController.getReservationById
);

router.get("/reservation", (_req, _res) => {
  throw new BadRequestError("Missing 'userId' parameter in the query");
});

router.patch(
  "/reservation/update/:reservationId",
  genericMiddlewares.validateParamId.bind(null, "reservationId"),
  genericMiddlewares.validateBodyUpdatedFields.bind(null, fields),
  reservationController.updateReservation
);

module.exports = router;
