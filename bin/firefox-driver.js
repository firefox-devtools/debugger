"use strict";

const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const By = webdriver.By;
const until = webdriver.until;
const Key = webdriver.Key;

const shouldStart = process.argv.indexOf("--start") > 0;
const useWebSocket = process.argv.indexOf("--websocket") > 0;

function firefoxBinary() {
  var binary = new firefox.Binary();
  binary.addArguments("--start-debugger-server",
    useWebSocket ? "ws:6080" : "6080");

  return binary;
}

function firefoxProfile() {
  var profile = new firefox.Profile();
  profile.setPreference('devtools.debugger.remote-port', 6080);
  profile.setPreference("devtools.debugger.remote-enabled",  true);
  profile.setPreference("devtools.chrome.enabled",  true);
  profile.setPreference("devtools.debugger.prompt-connection",  false);
  profile.setPreference("devtools.debugger.remote-use-websocket", useWebSocket);

  return profile;
}

function start() {
  let options = new firefox.Options();
  options.setProfile(firefoxProfile())
  options.setBinary(firefoxBinary());

  const driver = new firefox.Driver(options);
  return driver;
}

if (shouldStart) {
  const driver = start();
  driver.get("http://localhost:7999/todomvc");
  setInterval(() => {}, 100);
}

module.exports = { start, By, Key, until }
