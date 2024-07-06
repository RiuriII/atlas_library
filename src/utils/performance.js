const fs = require("fs");
const { performance } = require("perf_hooks");

// Capture performance
function capturePerformance() {
  return performance.now();
}

// Capture errors and write to CSV file
function captureErrors(error) {
  const timestamp = new Date().toLocaleDateString("pt-BR").replace(/\//gm, "_");
  const fileName = `error_${timestamp}.log`;
  const data = `"${error.stack}"\n`;
  fs.appendFile(fileName, data, (err) => {
    if (err) {
      console.error("Error writing error file:", err);
    } else {
      console.log(`Error captured in file: ${fileName}`);
    }
  });
}

// Delete old error files in period of 2 days
function deleteOldErrorFiles() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  fs.readdir(".", (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }
    files.forEach((file) => {
      if (
        file.startsWith("error_") &&
        new Date(file.split("_")[1].split(".")[0]) < twoDaysAgo
      ) {
        fs.unlink(file, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log(`Deleted old error file: ${file}`);
          }
        });
      }
    });
  });
}

// Write performance metrics to CSV file
function writePerformanceMetricsToFile(
  startTime,
  endTime,
  freeMemory,
  usedMemory,
  totalMemory,
  cpuUsage
) {
  const duration = endTime - startTime;
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const fileName = "performance_metrics.csv";
  const headers =
    "Timestamp,Duration (ms),Free Memory (MB),Used Memory (MB),Total Memory (MB),CPU Usage (%)\n";
  const data = `"${timestamp}",${duration.toFixed(2)},${(freeMemory / 1024 / 1024).toFixed(2)},${(usedMemory / 1024 / 1024).toFixed(2)},${(totalMemory / 1024 / 1024).toFixed(2)},${cpuUsage}\n`;

  // Check if the file exists, if not, write the header
  fs.access(fileName, fs.constants.F_OK, (err) => {
    if (err) {
      fs.writeFile(fileName, headers, (err) => {
        if (err) {
          console.error("Error writing headers to file:", err);
        }
      });
    }
  });

  // Append data to the file
  fs.appendFile(fileName, data, (err) => {
    if (err) {
      console.error("Error writing performance metrics to file:", err);
    } else {
      console.log("Performance metrics written to file:", fileName);
    }
  });
}

module.exports = {
  capturePerformance,
  captureErrors,
  deleteOldErrorFiles,
  writePerformanceMetricsToFile
};
