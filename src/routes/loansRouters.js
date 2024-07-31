const express = require("express");

const router = express.Router();

const loanController = require("../controllers/loanController");
const loanMiddlewares = require("../middlewares/loanMiddlewares");
const genericMiddlewares = require("../middlewares/genericMiddlewares");
const { BadRequestError } = require("../utils/apiError");
const authMiddlewares = require("../middlewares/authMiddlewares");

const fields = ["bookId", "userId"];

router.get(
  "/loans",
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  loanController.getAllLoans
);

router.post(
  "/loan",
  genericMiddlewares.validateBodyRequiredFields.bind(null, fields),
  authMiddlewares.verifyToken,
  loanController.createLoan
);

router.delete(
  "/loan/:loanId",
  genericMiddlewares.validateParamId.bind(null, "loanId"),
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  loanController.deleteLoan
);

router.delete("/loan", (_req, _res) => {
  throw new BadRequestError("Missing 'loanId' parameter in the query");
});

router.get(
  "/loan/user/:userId",
  genericMiddlewares.validateParamId.bind(null, "userId"),
  authMiddlewares.verifyToken,
  loanController.getUserLoansById
);

router.get(
  "/loan/:loanId",
  genericMiddlewares.validateParamId.bind(null, "loanId"),
  authMiddlewares.verifyToken,
  loanController.getLoanById
);

router.get("/loan/", (_req, _res) => {
  throw new BadRequestError("Missing 'loanId' parameter in the query");
});

router.patch(
  "/loan/return/:loanId",
  genericMiddlewares.validateParamId.bind(null, "loanId"),
  loanMiddlewares.validateReturnedBodyLoan,
  authMiddlewares.verifyToken,
  authMiddlewares.authorize.bind(null, ["admin", "sub-admin"]),
  loanController.updateLoanReturnStatus
);

router.get(
  "/loan/extend/:loanId",
  genericMiddlewares.validateParamId.bind(null, "loanId"),
  authMiddlewares.verifyToken,
  loanController.extendLoanReturnDate
);

module.exports = router;
