const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

const fileSizes = {
  "parser-worker.js": 60000,
  "pretty-print-worker.js": 10000,
  "search-worker.js": 5000
};

const firefoxPath = "./firefox";

function checkFileSizes() {
  let success = true;

  Object.keys(fileSizes).forEach(key => {
    const fullFirefoxPath = path.join(process.cwd(), firefoxPath);
    const testFile = fs.readFileSync(
      path.join(fullFirefoxPath, `devtools/client/debugger/new/dist/${key}`),
      "utf8"
    );
    const lineCount = testFile.split("\n").length;
    if (lineCount > fileSizes[key]) {
      console.log(
        chalk.red(
          `Oh no, ${key} is ${lineCount} lines, which is greater than ${
            fileSizes[key]
          } lines`
        )
      );
      success = false;
    } else {
      console.log(
        chalk.yellow(
          `${key} is ${lineCount} lines, which is not great, but fine...`
        )
      );
    }
  });

  return success;
}

const success = checkFileSizes();
process.exit(success ? 0 : 1);
