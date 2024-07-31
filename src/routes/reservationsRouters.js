const express = require("express");

const router = express.Router();

const reservationController = require("../controllers/reservationController");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const { BadRequestError } = require("../utils/apiError");
const authMiddlewares = require("../middlewares/authMiddlewares");

const fields = ["bookId", "userId", "active"];

router.get(
  "/reservations",
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  reservationController.getAllReservations
);

router.post(
  "/reservation",
  authMiddlewares.verifyToken,
  genericMiddlewares.validateBodyRequiredFields.bind(null, fields),
  reservationController.createReservation
);

router.delete(
  "/reservation/:reservationId",
  authMiddlewares.verifyToken,
  genericMiddlewares.validateParamId.bind(null, "reservationId"),
  reservationController.deleteReservation
);

router.delete("/reservation", (_req, _res) => {
  throw new BadRequestError("Missing 'reservationId' parameter in the query");
});

router.get(
  "/reservation/user/:userId",
  authMiddlewares.verifyToken,
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
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  reservationController.updateReservation
);

module.exports = router;
