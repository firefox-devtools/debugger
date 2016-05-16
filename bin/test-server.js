"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const firefoxDriver = require("./firefox-driver");

const By = firefoxDriver.By;
const until = firefoxDriver.until;
const Key = firefoxDriver.Key;

let driver;
let isQuiting = false;
let isOpen = false;

function debuggeeCommand(req, res) {
  const command = req.body.command;
  const timeout = req.body.timeout;
  const formattedCommand = command.split("\n").map(s=> "  " + s.trim()).join("\n")
  console.log("Initiating command\n" + formattedCommand)

  var isDone = false;
  var cb = () => {
    if (!isDone) {
      console.log("Command Executed\n");
      isDone = true;
      if (timer) {
        clearTimeout(timer);
      }
      res.sendStatus(200);
    }
  }

  try {
    var r  = eval(command);
  } catch (e) {
    console.log("error", e.stack);
  }

  var timer = setTimeout(cb, timeout);
  r.then(cb)
  .catch(err => {
    console.log("Command Failed", err.stack);
  });
}

function debuggeeStart(req, res) {
  if (!isQuiting && !isOpen) {
    driver = firefoxDriver.start();
    isOpen = true;
  }
  console.log("\nFirefox Start!")
  res.send('POST start driver');
}

function debuggeeStop(req, res) {
  isQuiting = true;
  driver.quit()
  .catch(e => console.log("QUIT failed", e.stack))
  .finally(() => {
    isQuiting = false;
    isOpen = false;
    console.log("Firefox Stop!")
    res.send('POST quit driver');
  });
}

function startServer() {
  var app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post('/start', debuggeeStart);
  app.post('/stop', debuggeeStop);
  app.post('/command', debuggeeCommand);

  // Serves todomvc from node_modules.
  // This is a test to see if going forward, we want to pull in test
  // examples from the community.
  app.use(express.static("node_modules"));

  app.listen(9002, function () {
    console.log('Debuggee Server listening on 9002!');
  });

  return app;
}

startServer();
