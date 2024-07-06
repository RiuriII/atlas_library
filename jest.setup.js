const { clearDatabase } = require("./src/utils/clearDatabase");

beforeAll(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await clearDatabase();
});
