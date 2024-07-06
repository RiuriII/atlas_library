const app = require("../app");
const request = require("supertest");
const { it, describe, expect } = require("@jest/globals");

describe("Authors Router", () => {
  let authorId;

  const testAuthorRouterWithError = async (scenario, method, url) => {
    const response = await request(app)[method](url).send(scenario);
    return response.status === 400 && response.body.message !== undefined;
  };

  describe("POST /author", () => {
    it("should create an author", async () => {
      const response = await request(app)
        .post("/author")
        .send({ name: "John Doe", about: "Author description" });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("insertId");
      authorId = response.body.insertId;
    });

    it("Should throw an error if author create with invalid field or blank", async () => {
      const scenarios = [
        { name: "John Doe", invalidField: "invalid" },
        { name: "" }
      ];

      for (const scenario of scenarios) {
        const hasError = testAuthorRouterWithError(scenario, "post", "/author");
        expect(hasError).toBeTruthy();
      }
    });
  });

  describe("GET /author", () => {
    it("should get all authors", async () => {
      const response = await request(app).get("/authors");
      console.log("authors: ", response.body);
      expect(response.status).toBe(200);
    });

    it("should get an author by id", async () => {
      const response = await request(app).get(`/author/${authorId}`);
      expect(response.status).toBe(200);
      expect(response.body).toContainEqual({
        name: "John Doe",
        about: "Author description",
        author_id: authorId
      });
    });

    it("Should throw an error if author not found", async () => {
      const response = await request(app).get(`/author/${authorId + 1}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if author id is not a number or is blank", async () => {
      const response = await request(app)
        .get("/author")
        .query({ authorId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PATCH /author/update", () => {
    it("should update an author", async () => {
      const response = await request(app)
        .patch(`/author/update/${authorId}`)
        .send({ name: "Jane Doe" });
      expect(response.status).toBe(204);
    });

    it("Should throw an error if author name is blank or wrong in update", async () => {
      const scenarios = [
        { name: "John Doe", invalidField: "invalid" },
        { name: "" }
      ];

      for (const scenario of scenarios) {
        const hasError = testAuthorRouterWithError(
          scenario,
          "patch",
          `/author/update/${authorId}`
        );
        expect(hasError).toBeTruthy();
      }
    });

    it("Should throw an error if author name is duplicate", async () => {
      const response = await request(app)
        .patch(`/author/update/${authorId}`)
        .send({ name: "Jane Doe" });
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("DELETE /author", () => {
    it("Should throw an error if author not found in delete", async () => {
      const response = await request(app).del(`/author/${authorId + 1}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if author id is not a number or is blank", async () => {
      const response = await request(app)
        .del("/author")
        .query({ authorId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should delete an author", async () => {
      const response = await request(app).del(`/author/${authorId}`);

      expect(response.status).toBe(204);
    });
  });
});
