const app = require("../app");
const request = require("supertest");
const { it, describe, expect } = require("@jest/globals");

describe("Categories Router", () => {
  let categoryId;

  const testCategoryRouterWithError = async (scenario, method, url) => {
    const response = await request(app)[method](url).send(scenario);
    return response.status === 400 && response.body.message !== undefined;
  };

  describe("POST /category", () => {
    it("should create an category", async () => {
      const response = await request(app)
        .post("/category")
        .send({ name: "Dark Fantasy" });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("insertId");
      categoryId = response.body.insertId;
    });

    it("Should throw an error if category create with invalid field or blank", async () => {
      const scenarios = [
        { name: "Fantasy", invalidField: "invalid" },
        { name: "" }
      ];

      for (const scenario of scenarios) {
        const hasError = testCategoryRouterWithError(
          scenario,
          "post",
          "/category"
        );
        expect(hasError).toBeTruthy();
      }
    });
  });

  describe("GET /category", () => {
    it("should get all categories", async () => {
      const response = await request(app).get("/categories");
      console.log("categories: ", response.body);
      expect(response.status).toBe(200);
    });

    it("should get an category by id", async () => {
      const response = await request(app).get(`/category/${categoryId}`);
      expect(response.status).toBe(200);
      expect(response.body).toContainEqual({
        name: "Dark Fantasy",
        category_id: categoryId
      });
    });

    it("Should throw an error if category not found", async () => {
      const response = await request(app).get(`/category/${categoryId + 1}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if category id is not a number or is blank", async () => {
      const response = await request(app)
        .get("/category")
        .query({ categoryId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PATCH /category/update", () => {
    it("should update an category", async () => {
      const response = await request(app)
        .patch(`/category/update/${categoryId}`)
        .send({ name: "Fantasy" });
      expect(response.status).toBe(204);
    });

    it("Should throw an error if category name is blank or wrong in update", async () => {
      const scenarios = [
        { name: "Dark Fantasy", invalidField: "invalid" },
        { name: "" }
      ];

      for (const scenario of scenarios) {
        const hasError = testCategoryRouterWithError(
          scenario,
          "patch",
          `/category/update/${categoryId}`
        );
        expect(hasError).toBeTruthy();
      }
    });

    it("Should throw an error if category name is duplicate", async () => {
      const response = await request(app)
        .patch(`/category/update/${categoryId}`)
        .send({ name: "Fantasy" });
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("DELETE /category", () => {
    it("Should throw an error if category not found in delete", async () => {
      const response = await request(app).del(`/author/${categoryId + 1}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if category id is not a number or is blank", async () => {
      const response = await request(app)
        .del("/category")
        .query({ categoryId: ["abc", ""] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should delete an category", async () => {
      const response = await request(app).del(`/category/${categoryId}`);

      expect(response.status).toBe(204);
    });
  });
});
