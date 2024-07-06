const cron = require("node-cron");
const os = require("os");
const osUtils = require("node-os-utils");
const { checkOverdueReservation } = require("./reservationService");
const { checkOverdueLoan } = require("./loanService");
const {
  capturePerformance,
  captureErrors,
  deleteOldErrorFiles,
  writePerformanceMetricsToFile
} = require("../utils/performance");

const cronJob = cron.schedule(
  "0 23 * * 1,3,5",
  async () => {
    try {
      console.log("Running a tasks");
      const cpuUsage = await osUtils.cpu.usage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      const startTime = capturePerformance();
      await checkOverdueReservation();
      await checkOverdueLoan();
      const endTime = capturePerformance();
      writePerformanceMetricsToFile(
        startTime,
        endTime,
        freeMemory,
        usedMemory,
        totalMemory,
        cpuUsage
      );
      deleteOldErrorFiles();
    } catch (error) {
      console.error("Error occurred during task execution:", error);
      captureErrors(error);
    }
  },
  { timezone: "America/Sao_Paulo" }
);

module.exports = {
  cronJob
};
