"use strict";

const webdriver = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const By = webdriver.By;
const until = webdriver.until;
const Key = webdriver.Key;
const minimist = require("minimist");

const args = minimist(process.argv.slice(2),
{ boolean: ["start", "tests", "websocket"] });

const isWindows = /^win/.test(process.platform);
const shouldStart = args.start;
const isTests = args.tests;
const useWebSocket = args.websocket;

function binaryArgs() {
  return [
    (!isWindows ? "-" : "") +
    "-start-debugger-server=" +
    (useWebSocket ? "ws:6080" : "6080")
  ];
}

function start() {
  const capabilities = new firefox.Options()
    .toCapabilities()
    .set("moz:firefoxOptions", {
      "args": binaryArgs(),
      "prefs": {
        "devtools.debugger.remote-port": 6080,
        "devtools.chrome.enabled": true,
        "devtools.debugger.prompt-connection": false,
        "devtools.debugger.remote-enabled": true,
        "devtools.debugger.remote-websocket": useWebSocket
      }
    });
  const driver = new webdriver.Builder()
    .forBrowser("firefox")
    .withCapabilities(capabilities)
    .build();

  return driver;
}

if (shouldStart) {
  const driver = start();
  driver.get("http://localhost:7999/todomvc");
  setInterval(() => {}, 100);
}

function getResults(driver) {
  driver
    .findElement(By.id("mocha-stats"))
    .getText().then(results => {
      console.log("results ", results);
      const match = results.match(/failures: (\d*)/);
      const resultCode = parseInt(match[1], 10) > 0 ? 1 : 0;
      process.exit(resultCode);
    });
}

if (isTests) {
  const driver = start();
  driver.get("http://localhost:8003");
  setTimeout(() => getResults(driver), 5000);
}

module.exports = { start, By, Key, until };
