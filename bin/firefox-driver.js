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
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post('/command', function (req, res) {
    const command = req.body.command;
    eval(command);
    console.log("command", command)
    res.send('POST request to the homepage');
  });

  app.listen(9002, function () {
    console.log('Debuggee Server listening on 9002!');
  });

  return app;
}

const driver = startDriver();
const app = startExpressServer();
