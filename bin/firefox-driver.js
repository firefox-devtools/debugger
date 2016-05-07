"use strict";

const webdriver = require('selenium-webdriver'),
    firefox = require('selenium-webdriver/firefox'),
    By = webdriver.By,
    until = webdriver.until,
    Key = webdriver.Key,
    child = require("child_process"),
    express = require("express"),
    bodyParser = require("body-parser");

function firefoxBinary() {
  /**
   * Binary.prototype.launch is being overriden to change
   * child.spawn to child.exec.
   *
   * Unfortunately, it also removes linux support because that
   * would have included additional dependencies.
   *
   * [BUG 2059](https://github.com/SeleniumHQ/selenium/issues/2059)
   */
  function launch(profile) {
    var env = {};
    Object.assign(env, this.env_, {XRE_PROFILE_PATH: profile});
    var args = ['-foreground'].concat(this.args_);
    return this.locate().then(function(firefox) {
      return child.exec(firefox + " " + args.join(" "), {
        env: env
      });
    });
  }

  var binary = new firefox.Binary('/Applications/Firefox.app/Contents/MacOS/firefox-bin');
  binary.addArguments('--start-debugger-server 6080')
  binary.launch = launch;

  return binary;
}

function firefoxProfile() {
  var profile = new firefox.Profile();
  profile.setPreference('devtools.debugger.remote-port', 6080);
  profile.setPreference("devtools.debugger.remote-enabled",  true);
  profile.setPreference("devtools.chrome.enabled",  true);
  profile.setPreference("devtools.debugger.prompt-connection",  false);

  return profile;
}

function startDriver() {
  let options = new firefox.Options();
  options.setProfile(firefoxProfile())
  options.setBinary(firefoxBinary());

  const driver = new firefox.Driver(options);
  return driver;
}

function startExpressServer() {
  var app = express();
  let driver;

  var isQuiting = false;
  var isOpen = false;

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post('/start', function(req, res) {
    if (!isQuiting && !isOpen) {
      driver = startDriver();
      isOpen = true;
    }
    res.send('POST start driver');
  });

  app.post('/stop', function(req, res) {
    isQuiting = true;
    driver.quit()
    .catch(e => console.log("QUIT failed", e.stack))
    .finally(() => {
      isQuiting = false;
      isOpen = false;
      res.send('POST quit driver');
    });
  });

  app.post('/command', function(req, res) {
    const command = req.body.command;
    const timeout = req.body.timeout;
    console.log("Initiating command", command)

    var isDone = false;
    var cb = () => {
      if (!isDone) {
        console.log("Command Executed", command);
        isDone = true;
        res.sendStatus(200);
      }
    }

    try {
      var r  = eval(command);
    } catch (e) {
      console.log("error", e.stack);
    }

    setTimeout(cb, timeout);
    r.then(cb)
    .catch(err => {
      console.log("Command Failed", err.stack);
    });
  });


  // Serves todomvc from node_modules.
  // This is a test to see if going forward, we want to pull in test
  // examples from the community.
  app.use(express.static("node_modules"));

  app.listen(9002, function () {
    console.log('Debuggee Server listening on 9002!');
  });

  return app;
}

const app = startExpressServer();
