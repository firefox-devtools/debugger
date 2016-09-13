"use strict";

const webdriver = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const By = webdriver.By;
const until = webdriver.until;
const Key = webdriver.Key;
const minimist = require("minimist");

const args = minimist(process.argv.slice(2), {
  boolean: "start",
  boolean: "tests",
  boolean: "websocket"
});

const isWindows = /^win/.test(process.platform);
const shouldStart = args.start;
const isTests = args.tests;
const useWebSocket = args.websocket;

function firefoxBinary() {
  let binary = new firefox.Binary();
    binary.addArguments((!isWindows ? "-" : "") + "-start-debugger-server",
    useWebSocket ? "ws:6080" : "6080");

  return binary;
}

function firefoxProfile() {
  let profile = new firefox.Profile();
  profile.setPreference("devtools.debugger.remote-port", 6080);
  profile.setPreference("devtools.debugger.remote-enabled", true);
  profile.setPreference("devtools.chrome.enabled", true);
  profile.setPreference("devtools.debugger.prompt-connection", false);
  profile.setPreference("devtools.debugger.remote-use-websocket", useWebSocket);

  return profile;
}

function start() {
  let options = new firefox.Options();
  options.setProfile(firefoxProfile());
  options.setBinary(firefoxBinary());

  const driver = new firefox.Driver(options);
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
