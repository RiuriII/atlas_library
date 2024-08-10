const app = require("../app");
const request = require("supertest");
const { it, describe, expect, beforeAll } = require("@jest/globals");
const { createAuthor } = require("../models/authorsModel");
const { createCategory } = require("../models/categoriesModel");
const { createBook } = require("../models/booksModel");
const { createLoan } = require("../models/loanModel");

describe("Fines Router", () => {
  let authorId;
  let categoryId;
  let loanId;
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

    loanId = await createLoan({
      bookId: bookId,
      userId: global.adminProfile.id,
      dateLoan: new Date(),
      dateReturnLoan: new Date()
    }).then((res) => res.insertId);
  });

  describe("POST /fine", () => {
    it("Should create fine", async () => {
      const response = await request(app)
        .post("/fine")
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({
          userId: global.adminProfile.id,
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
        const response = await request(app)
          .post("/fine")
          .auth(global.adminProfile.token, { type: "bearer" })
          .send(scenario);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });

    it("Should get fines by user", async () => {
      const response = await request(app)
        .post(`/fine/user/${global.adminProfile.id}`)
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty("fine_id", fineId);
    });

    it("Should get fines paid by user", async () => {
      const response = await request(app)
        .post(`/fine/user/${global.adminProfile.id}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({
          paid: true
        });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /fine", () => {
    it("Should get all fines", async () => {
      const response = await request(app)
        .get("/fines")
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(200);
    });

    it("Should get a fine by id", async () => {
      const response = await request(app)
        .get(`/fine/${fineId}`)
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty("fine_id", fineId);
    });

    it("Should throw an error if fine not found", async () => {
      const response = await request(app)
        .get(`/fine/${fineId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if fine id is not a number or is blank", async () => {
      const response = await request(app)
        .get("/fine/")
        .auth(global.adminProfile.token, { type: "bearer" })
        .query({ fineId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PATCH /fine", () => {
    it("Should throw an error if fine not found in update", async () => {
      const response = await request(app)
        .patch(`/fine/paidFine/${fineId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" })
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
        const response = await request(app)
          .patch(`/fine/paidFine/${fineId}`)
          .auth(global.adminProfile.token, { type: "bearer" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });

    it("Should update a fine, paid status", async () => {
      const response = await request(app)
        .patch(`/fine/paidFine/${fineId}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({
          paid: true,
          loanId: loanId,
          payment_date: "2024-02-26 02:31:03"
        });

      expect(response.status).toBe(204);
    });
  });

  describe("DELETE /fine", () => {
    it("Should throw an error if fine not found in delete", async () => {
      const response = await request(app)
        .del(`/fine/${fineId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if fine id is not a number or is blank", async () => {
      const response = await request(app)
        .del("/fine/")
        .auth(global.adminProfile.token, { type: "bearer" })
        .query({ fineId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should delete a fine", async () => {
      const response = await request(app)
        .del(`/fine/${fineId}`)
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(204);
    });
  });

  describe("Authorization Errors in fines Router", () => {
    const routes = [
      { method: "get", url: "/fines", header: global.userProfile.token },
      {
        method: "post",
        url: "/fine",
        header: global.userProfile.token,
        body: { userId: 2, bookId: 3, loanId: 1 }
      },
      { method: "delete", url: "/fine/1", header: global.userProfile.token },
      {
        method: "patch",
        url: "/fine/paidFine/1",
        header: global.userProfile.token,
        body: {
          paid: true,
          loanId: 1,
          payment_date: "2024-02-26 02:31:03"
        }
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
