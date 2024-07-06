const mysql = require("mysql2/promise");
const path = require("path");

const pathEnv = path.resolve(
  __dirname,
  `../../.env${process.env.NODE_ENV === "development" ? ".development" : ""}`
);
require("dotenv").config({
  path: pathEnv
});

let connection;

async function createConnectionPool() {
  connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  connection.on("error", (err) => {
    console.error("Erro na conexão com o banco de dados:", err);
  });

  return connection;
}

async function closeConnectionPool() {
  if (connection) {
    await connection.end();
  }
}

module.exports = {
  createConnectionPool,
  closeConnectionPool
};
