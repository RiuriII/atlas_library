const dotenv = require("dotenv");
const app = require("./app");
const { cronJob } = require("./services/cronJobsService");

dotenv.config();

console.log("port: " + process.env.PORT);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running or port ${PORT}`));

cronJob.start();
