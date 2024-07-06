const app = require("../app");
const request = require("supertest");
const { it, describe, expect, beforeAll } = require("@jest/globals");
const { createBook } = require("../models/booksModel");
const { createUser } = require("../models/usersModel");
const { createAuthor } = require("../models/authorsModel");
const { createCategory } = require("../models/categoriesModel");

describe("Loans Router", () => {
  let authorId;
  let categoryId;
  let userId;
  let bookId;
  let loanId;

  beforeAll(async () => {
    authorId = await createAuthor({
      name: "John",
      about: "Author description"
    }).then((res) => res.insertId);

    categoryId = await createCategory({
      name: "Fiction"
    }).then((res) => res.insertId);

    bookId = await createBook({
      title: "The Hobbit",
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
      name: "Lester",
      email: "lester@aj.com",
      password: "123",
      whatsapp: false,
      number: "4792755777"
    }).then((res) => res.insertId);
  });

  describe("POST /loans", () => {
    it("Should create a new loan", async () => {
      const response = await request(app).post("/loan").send({
        bookId: bookId,
        userId: userId
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("insertId");
      loanId = response.body.insertId;
    });

    it("Should throw an error if create loan with invalid field or missing field", async () => {
      const response = await request(app).post("/loan").send({
        invalidField: "invalid"
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if body request is empty", async () => {
      const response = await request(app).post("/loan").send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /loans", () => {
    it("Should get all loans", async () => {
      const response = await request(app).get("/loans");
      expect(response.status).toBe(200);
    });

    it("Should get a lona by user id", async () => {
      const response = await request(app).get(`/loan/user/${userId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("loan_id", loanId);
    });

    it("Should get loan by id", async () => {
      const response = await request(app).get(`/loan/${loanId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("loan_id", loanId);
    });

    it("Should extend return date of loan", async () => {
      const response = await request(app).get(`/loan/extend/${loanId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("extendedReturnDate");
    });

    it("Should throw an error if extend loan two times", async () => {
      const response = await request(app).get(`/loan/extend/${loanId}`);
      expect(response.statusCode).toBe(409);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if loan not found", async () => {
      const response = await request(app).get(`/loan/${loanId + 1}`);
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if loan id is not a number or is blank", async () => {
      const response = await request(app)
        .get(`/loan/`)
        .query({ loanId: ["abc", ""] });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PATCH /loans", () => {
    it("Should throw an error if update loan with empty or invalid field", async () => {
      const scenarios = [
        { returned: false },
        { returned: "" },
        { invalidField: "invalid" }
      ];

      for (const scenario of scenarios) {
        const response = await request(app)
          .patch(`/loan/return/${loanId}`)
          .send(scenario);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });

    it("Should throw an error if loan not found", async () => {
      const response = await request(app)
        .patch(`/loan/return/${loanId + 1}`)
        .send({ returned: true });
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should update a return status of loan", async () => {
      const response = await request(app)
        .patch(`/loan/return/${loanId}`)
        .send({ returned: true });

      expect(response.statusCode).toBe(204);
    });
  });

  describe("DELETE /loans", () => {
    it("Should throw an error if loan not found in delete", async () => {
      const response = await request(app).del(`/loan/${loanId + 1}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error id loan id is not a number or is blank", async () => {
      const response = await request(app)
        .del("/loan/")
        .query({ loanId: ["abc", ""] });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should delete a loan", async () => {
      const response = await request(app).del(`/loan/${loanId}`);
      expect(response.status).toBe(204);
    });
  });
});
