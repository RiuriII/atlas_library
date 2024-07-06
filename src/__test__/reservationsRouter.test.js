const app = require("../app");
const request = require("supertest");
const { it, describe, expect, beforeAll } = require("@jest/globals");
const { createBook, updateBook } = require("../models/booksModel");
const { createUser } = require("../models/usersModel");
const { createAuthor } = require("../models/authorsModel");
const { createCategory } = require("../models/categoriesModel");
const { createLoan } = require("../models/loanModel");

describe("Reservations Router", () => {
  let reservationId;
  let authorId;
  let categoryId;
  let userId;
  let bookId;
  let loanId;

  beforeAll(async () => {
    authorId = await createAuthor({
      name: "Rick",
      about: "Author description"
    }).then((res) => res.insertId);

    categoryId = await createCategory({
      name: "Romance"
    }).then((res) => res.insertId);

    bookId = await createBook({
      title: "Back to the Future",
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
      name: "Donny",
      email: "donny@j.com",
      password: "123",
      whatsapp: false,
      number: "4797777177"
    }).then((res) => res.insertId);

    loanId = await createLoan({
      bookId,
      userId,
      dateLoan: new Date(),
      dateReturnLoan: new Date(new Date().setDate(new Date().getDate() + 5))
    }).then((res) => res.insertId);
    await updateBook(bookId, { status: "reserved", available: false });
  });

  describe("POST /reservations", () => {
    it("Should create a reservation", async () => {
      const response = await request(app).post("/reservation").send({
        bookId,
        userId
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("insertId");
      reservationId = response.body.insertId;
    });

    it("Should throw an error if create reservation with invalid field or missing field", async () => {
      const response = await request(app).post("/reservation").send({
        invalidField: "invalid"
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if body request is empty", async () => {
      const response = await request(app).post("/reservation").send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /reservations", () => {
    it("Should get reservation by id", async () => {
      const response = await request(app).get(`/reservation/${reservationId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("reservation_id", reservationId);
    });

    it("Should get all reservations", async () => {
      const response = await request(app).get("/reservations");

      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("reservation_id", reservationId);
    });

    it("Should get reservation by user id", async () => {
      const response = await request(app).get(`/reservation/user/${userId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("reservation_id", reservationId);
    });

    it("Should throw an erro if reservation id NaN or blank", async () => {
      const routes = [
        "/reservation/a",
        "/reservation/",
        "/reservation/user/a",
        "/reservation/user/"
      ];

      for (const route of routes) {
        const response = await request(app).get(`${route}`);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });
  });

  describe("PATCH /reservations", () => {
    it("Should update a reservation", async () => {
      const response = await request(app)
        .patch(`/reservation/update/${reservationId}`)
        .send({ active: false });
      expect(response.statusCode).toBe(204);
    });
    it("Should throw an error if update reservation with invalid field or blank field", async () => {
      const scenarios = [{ invalidField: "invalid" }, { active: "" }];

      for (const scenario of scenarios) {
        const response = await request(app)
          .patch(`/reservation/update/${reservationId}`)
          .send(scenario);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });
  });

  describe("DELETE /reservations", () => {
    it("Should throw an erros if reservation id is not a number or is blank", async () => {
      const response = await request(app)
        .del("/reservation")
        .query({
          reservationId: ["abc", ""]
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if reservation id not found", async () => {
      const response = await request(app).del(
        `/reservation/${reservationId + 1}`
      );
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should delete  a reservation", async () => {
      const response = await request(app).del(`/reservation/${reservationId}`);

      expect(response.statusCode).toBe(204);
    });
  });
});
