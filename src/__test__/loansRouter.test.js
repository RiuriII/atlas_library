const app = require("../app");
const request = require("supertest");
const { it, describe, expect, beforeAll } = require("@jest/globals");
const { createBook } = require("../models/booksModel");
const { createAuthor } = require("../models/authorsModel");
const { createCategory } = require("../models/categoriesModel");

describe("Loans Router", () => {
  let authorId;
  let categoryId;
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
  });

  describe("POST /loans", () => {
    it("Should create a new loan", async () => {
      const response = await request(app)
        .post("/loan")
        .auth(global.userProfile.token, { type: "bearer" })
        .send({
          bookId: bookId,
          userId: global.userProfile.id
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("insertId");
      loanId = response.body.insertId;
    });

    it("Should throw an error if create loan with invalid field or missing field", async () => {
      const response = await request(app)
        .post("/loan")
        .auth(global.userProfile.token, { type: "bearer" })
        .send({
          invalidField: "invalid"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if body request is empty", async () => {
      const response = await request(app)
        .post("/loan")
        .auth(global.userProfile.token, { type: "bearer" })
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /loans", () => {
    it("Should get all loans", async () => {
      const response = await request(app)
        .get("/loans")
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(200);
    });

    it("Should get a lona by user id", async () => {
      const response = await request(app)
        .get(`/loan/user/${global.userProfile.id}`)
        .auth(global.userProfile.token, { type: "bearer" });

      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("loan_id", loanId);
    });

    it("Should get loan by id", async () => {
      const response = await request(app)
        .get(`/loan/${loanId}`)
        .auth(global.userProfile.token, { type: "bearer" });

      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("loan_id", loanId);
    });

    it("Should extend return date of loan", async () => {
      const response = await request(app)
        .get(`/loan/extend/${loanId}`)
        .auth(global.userProfile.token, { type: "bearer" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("extendedReturnDate");
    });

    it("Should throw an error if extend loan two times", async () => {
      const response = await request(app)
        .get(`/loan/extend/${loanId}`)
        .auth(global.userProfile.token, { type: "bearer" });

      expect(response.statusCode).toBe(409);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if loan not found", async () => {
      const response = await request(app)
        .get(`/loan/${loanId + 1}`)
        .auth(global.userProfile.token, { type: "bearer" });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if loan id is not a number or is blank", async () => {
      const response = await request(app)
        .get(`/loan/`)
        .auth(global.userProfile.token, { type: "bearer" })
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
          .auth(global.adminProfile.token, { type: "bearer" })
          .send(scenario);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });

    it("Should throw an error if loan not found", async () => {
      const response = await request(app)
        .patch(`/loan/return/${loanId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({ returned: true });
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should update a return status of loan", async () => {
      const response = await request(app)
        .patch(`/loan/return/${loanId}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({ returned: true });

      expect(response.statusCode).toBe(204);
    });
  });

  describe("DELETE /loans", () => {
    it("Should throw an error if loan not found in delete", async () => {
      const response = await request(app)
        .del(`/loan/${loanId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error id loan id is not a number or is blank", async () => {
      const response = await request(app)
        .del("/loan/")
        .auth(global.adminProfile.token, { type: "bearer" })
        .query({ loanId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should delete a loan", async () => {
      const response = await request(app)
        .del(`/loan/${loanId}`)
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(204);
    });
  });

  describe("Authorization Errors in Loan Router", () => {
    const routes = [
      { method: "get", url: "/loans", header: global.userProfile.token },
      { method: "delete", url: "/loan/1", header: global.userProfile.token },
      {
        method: "patch",
        url: "/loan/return/1",
        header: global.userProfile.token,
        body: { returned: true }
      }
    ];

    routes.forEach((route) => {
      it(`should return 401 for unauthorized access to ${route.method.toUpperCase()} ${route.url}`, async () => {
        const response = await request(app)
          [route.method](route.url)
          .auth(route.header)
          .send(route.body || {});
        expect(response.status).toBe(401);
      });
    });
  });
});
