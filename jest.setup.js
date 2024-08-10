const { clearDatabase } = require("./src/utils/clearDatabase");
const { createUser } = require("./src/models/usersModel");
const encryption = require("./src/services/encryptionService");
const request = require("supertest");
const app = require("./src/app");

global.adminProfile = {};
global.subAdminProfile = {};
global.userProfile = {};

beforeAll(async () => {
  await clearDatabase();

  const users = [
    {
      name: "admin",
      whatsapp: true,
      number: "1234567892",
      email: "admin@example.com",
      password: "admin123",
      role: "admin"
    },
    {
      name: "subAdmin",
      whatsapp: false,
      number: "1234567891",
      email: "subadmin@example.com",
      password: "subAdmin123",
      role: "sub-admin"
    },
    {
      name: "user",
      whatsapp: true,
      number: "1234567890",
      email: "user@example.com",
      password: "user123",
      role: "user"
    }
  ];

  for (const user of users) {
    const encryptedPassword = await encryption.encrypt(user.password);
    const createdUser = await createUser({
      name: user.name,
      whatsapp: user.whatsapp,
      number: user.number,
      email: user.email,
      password: encryptedPassword,
      role: user.role
    });

    const loginResponse = await request(app)
      .post("/user/login")
      .send({ email: user.email, password: user.password });

    const userProfile = {
      id: createdUser.insertId,
      token: loginResponse.body.token,
      ...user
    };

    if (user.role === "admin") {
      global.adminProfile = userProfile;
    } else if (user.role === "sub-admin") {
      global.subAdminProfile = userProfile;
    } else if (user.role === "user") {
      global.userProfile = userProfile;
    }
  }
});

afterAll(async () => {
  await clearDatabase();
});
