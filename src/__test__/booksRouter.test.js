const { it, describe, expect, beforeAll } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { createAuthor } = require("../models/authorsModel");
const { createCategory } = require("../models/categoriesModel");

describe("Books Router", () => {
  let bookId;
  let authorId;
  let categoryId;

  const testBookRouterWithError = async (scenario, method, url) => {
    const response = await request(app)
      [method](url)
      .auth(global.adminProfile.token, { type: "bearer" })
      .send(scenario);
    return response.status === 400 && response.body.message !== undefined;
  };

  beforeAll(async () => {
    authorId = await createAuthor({
      name: "Mary",
      about: "Author description"
    }).then((res) => res.insertId);

    categoryId = await createCategory({
      name: "Mystery"
    }).then((res) => res.insertId);
  });

  describe("POST /book", () => {
    it("Should create a new book", async () => {
      const bookData = {
        title: "The Lord of the Rings",
        publication_year: 1954,
        available: true,
        status: "available",
        rating: 4.5,
        quantity: 10,
        description: "A book about the Lord of the Rings",
        authorId: authorId,
        categoryId: categoryId
      };

      const response = await request(app)
        .post("/book")
        .auth(global.adminProfile.token, { type: "bearer" })
        .send(bookData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("insertId");

      bookId = response.body.insertId;
    });

    it("Should throw an error if book create with invalid field or missing field", async () => {
      const scenarios = [
        // invalid fields
        { title: "The Lord of the Rings", invalidField: "invalid" },
        // missing required fields
        { title: "The Lord of the Rings" }
      ];

      for (const scenario of scenarios) {
        const hasError = testBookRouterWithError(scenario, "post", "/book");
        expect(hasError).toBeTruthy();
      }
    });

    it("Should throw an error if user already exists", async () => {
      const response = await request(app)
        .post("/book")
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({
          title: "The Lord of the Rings",
          publication_year: 1954,
          available: true,
          status: "available",
          rating: 4.5,
          quantity: 10,
          description: "A book about the Lord of the Rings",
          authorId: authorId,
          categoryId: categoryId
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("message");
    });
  });
  describe("GET /book", () => {
    it("Should get all books", async () => {
      const response = await request(app).get("/books");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it("Should get a book by id", async () => {
      const response = await request(app).get(`/book/${bookId}`);
      expect(response.status).toBe(200);
      expect(response.body[0]).toEqual({
        book_id: bookId,
        title: "The Lord of the Rings",
        publication_year: "1954",
        available: 1,
        status: "available",
        rating: "4.5",
        quantity: 10,
        description: "A book about the Lord of the Rings",
        fk_author_id: authorId,
        fk_category_id: categoryId
      });
    });

    it("Should verify if book is available", async () => {
      const response = await request(app).get(`/book/availability/${bookId}`);
      expect(response.status).toBe(200);
      expect(response.body.book).toEqual({
        title: "The Lord of the Rings",
        available: 1,
        status: "available"
      });
    });

    it("Should throw an error if book id is not a number or is blank", async () => {
      const response = await request(app)
        .get("/book/")
        .query({ bookId: ["abc", ""] });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if book not found", async () => {
      const response = await request(app).get(`/book/${bookId + 1}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PATCH /book", () => {
    it("Should update a book", async () => {
      const response = await request(app)
        .patch(`/book/update/${bookId}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({
          title: "The Lord of the Onions",
          publication_year: 1955
        });
      expect(response.status).toBe(204);
    });

    it("Should throw an error if book not found in update", async () => {
      const response = await request(app)
        .patch(`/book/update/${bookId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({
          title: "The Lord of the Onions",
          publication_year: 1955
        });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if book id is not a number or is blank", async () => {
      const response = await request(app)
        .patch("/book/update/")
        .auth(global.adminProfile.token, { type: "bearer" })
        .query({ bookId: ["adb", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if update with invalid field", async () => {
      const response = await request(app)
        .patch(`/book/update/${bookId}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({
          title: "The Lord of the Onions",
          invalidField: "invalid"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("DELETE /book", () => {
    it("Should throw an error if book not found in delete", async () => {
      const response = await request(app)
        .del(`/book/${bookId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if book id is not a number or is blank", async () => {
      const response = await request(app)
        .del("/book")
        .auth(global.adminProfile.token, { type: "bearer" })
        .query({ bookId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should delete a book", async () => {
      const response = await request(app)
        .del(`/book/${bookId}`)
        .auth(global.adminProfile.token, { type: "bearer" });
      expect(response.status).toBe(204);
    });
  });

  describe("Authorization Errors in Author Router", () => {
    const routes = [
      {
        method: "post",
        url: "/book",
        header: global.userProfile.token,
        body: {
          title: "The Lord of the Rings",
          publication_year: "1954",
          available: 1,
          status: "available",
          rating: "4.5",
          quantity: 10,
          description: "A book about the Lord of the Rings",
          fk_author_id: authorId,
          fk_category_id: categoryId
        }
      },
      { method: "delete", url: "/book/1", header: global.userProfile.token },
      {
        method: "patch",
        url: "/book/update/1",
        header: global.userProfile.token,
        body: { title: "Updated Name" }
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
