const app = require("../app");
const request = require("supertest");
const { it, describe, expect, beforeAll } = require("@jest/globals");
const { createBook, updateBook } = require("../models/booksModel");
const { createAuthor } = require("../models/authorsModel");
const { createCategory } = require("../models/categoriesModel");
const { createLoan } = require("../models/loanModel");

describe("Reservations Router", () => {
  let reservationId;
  let authorId;
  let categoryId;
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

    loanId = await createLoan({
      bookId,
      userId: global.subAdminProfile.id,
      dateLoan: new Date(),
      dateReturnLoan: new Date(new Date().setDate(new Date().getDate() + 5))
    }).then((res) => res.insertId);
    await updateBook(bookId, { status: "borrowed", available: false });
  });

  describe("POST /reservations", () => {
    it("Should create a reservation", async () => {
      const response = await request(app)
        .post("/reservation")
        .auth(global.userProfile.token, { type: "bearer" })
        .send({
          bookId,
          userId: global.userProfile.id
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("insertId");
      reservationId = response.body.insertId;
    });

    it("Should throw an error if create reservation with invalid field or missing field", async () => {
      const response = await request(app)
        .post("/reservation")
        .auth(global.userProfile.token, { type: "bearer" })
        .send({
          invalidField: "invalid"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if body request is empty", async () => {
      const response = await request(app)
        .post("/reservation")
        .auth(global.userProfile.token, { type: "bearer" })
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /reservations", () => {
    it("Should get reservation by id", async () => {
      const response = await request(app)
        .get(`/reservation/${reservationId}`)
        .auth(global.userProfile.token, { type: "bearer" });

      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("reservation_id", reservationId);
    });

    it("Should get all reservations", async () => {
      const response = await request(app)
        .get("/reservations")
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toHaveProperty("reservation_id", reservationId);
    });

    it("Should get reservation by user id", async () => {
      const response = await request(app)
        .get(`/reservation/user/${global.userProfile.id}`)
        .auth(global.adminProfile.token, { type: "bearer" });

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
        const response = await request(app)
          .get(`${route}`)
          .auth(global.adminProfile.token, { type: "bearer" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message");
      }
    });
  });

  describe("PATCH /reservations", () => {
    it("Should update a reservation", async () => {
      const response = await request(app)
        .patch(`/reservation/update/${reservationId}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({ active: false });

      expect(response.statusCode).toBe(204);
    });

    it("Should throw an error if update reservation with invalid field or blank field", async () => {
      const scenarios = [{ invalidField: "invalid" }, { active: "" }];

      for (const scenario of scenarios) {
        const response = await request(app)
          .patch(`/reservation/update/${reservationId}`)
          .auth(global.adminProfile.token, { type: "bearer" })
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
        .auth(global.userProfile.token, { type: "bearer" })
        .query({
          reservationId: ["abc", ""]
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if reservation id not found", async () => {
      const response = await request(app)
        .del(`/reservation/${reservationId + 1}`)
        .auth(global.userProfile.token, { type: "bearer" });
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should delete  a reservation", async () => {
      const response = await request(app)
        .del(`/reservation/${reservationId}`)
        .auth(global.userProfile.token, { type: "bearer" });

      expect(response.statusCode).toBe(204);
    });
  });

  describe("Authorization Errors in Reservation  Router", () => {
    const routes = [
      {
        method: "get",
        url: "/reservations",
        header: global.userProfile.token
      },
      {
        method: "patch",
        url: "/reservation/update/1",
        header: global.userProfile.token,
        body: { active: false }
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
