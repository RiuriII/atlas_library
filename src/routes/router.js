const express = require("express");

const router = express.Router();

const booksRouters = require("./booksRouters");
const authorsRouters = require("./authorsRouters");
const categoriesRouters = require("./categoriesRouters");
const usersRouters = require("./usersRouters");
const reservationsRouters = require("./reservationsRouters");
const loansRouters = require("./loansRouters");
const finesRouters = require("./finesRouters");

router.use(booksRouters);
router.use(authorsRouters);
router.use(categoriesRouters);
router.use(usersRouters);
router.use(reservationsRouters);
router.use(loansRouters);
router.use(finesRouters);

router.all("*", (_req, res) => {
  res.header("Allow", "POST, PATCH, DELETE, OPTIONS");
  res.status(200).end();
});

router.options("*", (_req, res) => {
  res.header("Allow", "POST, PATCH, DELETE, OPTIONS");
  res.status(200).end();
});

module.exports = router;
