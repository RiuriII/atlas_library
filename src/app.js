require("express-async-errors");
const express = require("express");
const router = require("./routes/router");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
app.use(express.json());
app.use(router);

app.use(errorMiddleware);

module.exports = app;
