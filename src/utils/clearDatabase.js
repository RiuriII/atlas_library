const db = require("../models/connection");

/**
 * Asynchronously clears all data from database.
 */
const clearDatabase = async () => {
  try {
    const connection = await db.createConnectionPool();

    const tables = [
      "fines",
      "loans",
      "reservations",
      "books",
      "authors",
      "categories",
      "users"
    ];

    for (const table of tables) {
      const query = `DELETE FROM ${table}`;
      await connection.execute(query);
    }
  } catch (error) {
    console.error("Erro ao limpar tabelas:", error);
    throw error;
  } finally {
    await db.closeConnectionPool();
    console.log("Tables cleared successfully.");
  }
};

module.exports = { clearDatabase };
