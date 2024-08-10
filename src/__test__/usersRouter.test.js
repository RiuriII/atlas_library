const app = require("../app");
const request = require("supertest");
const { it, describe, expect } = require("@jest/globals");

describe("Users Router", () => {
  let userId;

  const testUserRouterWithError = async (scenario, method, url) => {
    const response = await request(app)
      [method](url)
      .auth(global.adminProfile.token, { type: "bearer" })
      .send(scenario);
    return response.status === 400 && response.body.message !== undefined;
  };

  describe("POST /user", () => {
    it("should create an user", async () => {
      const response = await request(app).post("/user").send({
        name: "John Doe",
        whatsapp: true,
        number: "47988765425",
        email: "john@example.com",
        password: "123456",
        role: "user"
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("insertId");
      userId = response.body.insertId;
    });

    it("Should throw an error if user create with invalid field or blank", async () => {
      const scenarios = [
        // Invalid field
        { name: "John Smith", invalidField: "invalid" },
        // Blank field
        { name: "" },
        // Phone number invalid
        {
          name: "John Smith",
          whatsapp: true,
          number: "559887654",
          email: "john.smith@example.com",
          password: "123456"
        },
        // Email invalid
        {
          name: "John Smith",
          whatsapp: true,
          number: "5547988765423",
          email: "john.smith@@example.com",
          password: "123456"
        }
      ];

      for (const scenario of scenarios) {
        const hasError = await testUserRouterWithError(
          scenario,
          "post",
          "/user"
        );
        expect(hasError).toBeTruthy();
      }
    });

    it("Should throw an error if user already exists", async () => {
      const response = await request(app).post("/user").send({
        name: "John Doe",
        whatsapp: true,
        number: "47988765425",
        email: "john@example.com",
        password: "123456",
        role: "user"
      });

      expect(response.status).toBe(409);
    });

    it("Should login an user", async () => {
      const response = await request(app).post("/user/login").send({
        email: "john@example.com",
        password: "123456"
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("Should throw an error if user login with invalid password", async () => {
      const response = await request(app).post("/user/login").send({
        email: "john@example.com",
        password: "123456a"
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if user id is not a number or is blank /user/login", async () => {
      const response = await request(app)
        .post("/user/login")
        .query({ userId: ["abc", ""] });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /user", () => {
    it("Should get all users", async () => {
      const response = await request(app)
        .get("/users")
        .auth(global.adminProfile.token, { type: "bearer" });

      expect(response.status).toBe(200);
      expect(response.body.some((user) => user.user_id == userId)).toBeTruthy();
    });

    it("Should get user by id", async () => {
      const response = await request(app)
        .get(`/user/${userId}`)
        .auth(global.adminProfile.token, { type: "bearer" });
      expect(response.status).toBe(200);
      expect(response.body[0].user_id).toBe(userId);
    });

    it("Should throw an error if user not found", async () => {
      const response = await request(app)
        .get(`/user/${userId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if user id is not a number or is blank /user", async () => {
      const response = await request(app)
        .get("/user")
        .auth(global.adminProfile.token, { type: "bearer" })
        .query({ userId: ["abc", ""] });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PATCH /user", () => {
    it("Should update an user", async () => {
      const response = await request(app)
        .patch(`/user/update/${userId}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({ name: "John Smith" });
      expect(response.status).toBe(204);
    });

    it("Should throw an error if update fields are empty or invalid.", async () => {
      const scenarios = [
        // Invalid field
        { name: "John Smith", invalidField: "invalid" },
        // Blank field
        { name: "" },
        // Phone number invalid
        {
          name: "John Smith",
          number: "559887654"
        },
        // Email invalid
        {
          name: "John Smith",
          email: "john.smith@@example.com"
        }
      ];

      for (const scenario of scenarios) {
        const hasError = await testUserRouterWithError(
          scenario,
          "patch",
          `/user/update/${userId}`
        );
        expect(hasError).toBeTruthy();
      }
    });

    it("Should throw an error if user not found", async () => {
      const response = await request(app)
        .patch(`/user/update/${userId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({ name: "John Smith" });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an error if user id is not a number or is blank /user/update", async () => {
      const response = await request(app)
        .patch("/user/update")
        .auth(global.adminProfile.token, { type: "bearer" })
        .query({ userId: ["abc", ""] });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("Should throw an erro if update date is duplicate", async () => {
      const response = await request(app)
        .patch(`/user/update/${userId}`)
        .auth(global.adminProfile.token, { type: "bearer" })
        .send({ name: "John Smith" });
      expect(response.status).toBe(409);
    });
  });

  describe("DELETE /user", () => {
    it("Should delete an user", async () => {
      const response = await request(app)
        .del(`/user/${userId}`)
        .auth(global.adminProfile.token, { type: "bearer" });
      expect(response.status).toBe(204);
    });

    it("Should throw an error if user not found", async () => {
      const response = await request(app)
        .del(`/user/${userId + 1}`)
        .auth(global.adminProfile.token, { type: "bearer" });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Authorization Errors in User Router", () => {
    const routes = [
      { method: "get", url: "/users", header: global.userToken },
      {
        method: "delete",
        url: "/author/1",
        header: global.userToken
      },
      { method: "delete", url: "/author/1", header: global.userToken },
      {
        method: "patch",
        url: "/user/update/1",
        header: global.userToken,
        body: { name: "Updated Name" }
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
