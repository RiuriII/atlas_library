const app = require("../app");
const request = require("supertest");
const { it, describe, expect, beforeAll } = require("@jest/globals");
const { createAuthor } = require("../models/authorsModel");
const { createCategory } = require("../models/categoriesModel");
const { createBook } = require("../models/booksModel");
const { createUser } = require("../models/usersModel");
const { createLoan } = require("../models/loanModel");

describe("Fines Router", () => {
  let authorId;
  let categoryId;
  let loanId;
  let userId;
  let bookId;
  let fineId;

  beforeAll(async () => {
    authorId = await createAuthor({
      name: "Marie",
      about: "Author description"
    }).then((res) => res.insertId);

    categoryId = await createCategory({
      name: "Mystery"
    }).then((res) => res.insertId);

    bookId = await createBook({
      title: "The Awakening",
      publication_year: 1954,
      available: true,
      status: "available",
      rating: 4.5,
      quantity: 10,
      description: "A book about the Lord of the Rings",
      authorId: authorId,
      categoryId: categoryId
    }).then((res) => res.insertId);

    userId = await createUser({
      name: "Foster",
      email: "foster@j.com",
      password: "123",
      whatsapp: false,
      number: "4797337777"
    }).then((res) => res.insertId);

    loanId = await createLoan({
      bookId: bookId,
      userId: userId,
      dateLoan: new Date(),
      dateReturnLoan: new Date()
    }).then((res) => res.insertId);
  });

  describe("POST /fine", () => {
    it("Should create fine", async () => {
      const response = await request(app).post("/fine").send({
        userId: userId,
        bookId: bookId,
        loanId: loanId
      });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("insertId");

      fineId = response.body.insertId;
    });

    it("Should throw an error if create fine with invalid field or missing field", async () => {
      const scenarios = [{ userId: 1 }, { userId: 1, invalidField: "invalid" }];

      for (const scenario of scenarios) {
        const response = await request(app).post("/fine").send(scenario);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });
  });

  describe("GET /fine", () => {
    it("Should get all fines", async () => {
      const response = await request(app).get("/fines");
      expect(response.status).toBe(200);
    });

    it("Should get a fine by id", async () => {
      const response = await request(app).get(`/fine/${fineId}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty("fine_id", fineId);
    });

    it("Should throw an error if fine not found", async () => {
      const response = await request(app).get(`/fine/${fineId + 1}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if fine id is not a number or is blank", async () => {
      const response = await request(app)
        .get("/fine/")
        .query({ fineId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });
  describe("PATCH /fine", () => {
    it("Should throw an error if fine not found in update", async () => {
      const response = await request(app)
        .patch(`/fine/${fineId + 1}/paidFine`)
        .send({
          paid: true,
          payment_date: "2024-02-26 02:31:03",
          loanId: loanId
        });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an erros if fine id is not a number or is blank", async () => {
      const fineIds = ["abc", ""];

      for (const fineId of fineIds) {
        const response = await request(app).patch(`/fine/${fineId}/paidFine`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });

    it("Should update a fine, paid status", async () => {
      const response = await request(app)
        .patch(`/fine/${fineId}/paidFine`)
        .send({
          paid: true,
          loanId: loanId,
          payment_date: "2024-02-26 02:31:03"
        });
      console.log(response.body, response.status);
      expect(response.status).toBe(204);
    });
  });

  describe("DELETE /fine", () => {
    it("Should throw an error if fine not found in delete", async () => {
      const response = await request(app).del(`/fine/${fineId + 1}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if fine id is not a number or is blank", async () => {
      const response = await request(app)
        .del("/fine/")
        .query({ fineId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should delete a fine", async () => {
      const response = await request(app).del(`/fine/${fineId}`);
      expect(response.status).toBe(204);
    });
  });
});
