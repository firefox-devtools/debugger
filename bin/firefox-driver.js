"use strict";

/**
  NOTE: you'll need to be running selenium server beforehand
  java -jar ~/bin/selenium-server-standalone-2.53.0.jar
*/

const webdriver = require('selenium-webdriver'),
    firefox = require('selenium-webdriver/firefox'),
    By = webdriver.By,
    until = webdriver.until,
    Key = webdriver.Key,
    child = require("child_process");

function firefoxBinary() {
  /**
   * Binary.prototype.launch is being overriden to change
   * child.spawn to child.exec.
   *
   * Unfortunately, it also removes linux support because that
   * would have included additional dependencies.
   *
   * BUG ???
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


let options = new firefox.Options();
options.setProfile(firefoxProfile())
options.setBinary(firefoxBinary());

const driver = new firefox.Driver(options);


driver.get('http://todomvc.com/examples/backbone');

var input = driver.findElement(By.className('new-todo'));
input.sendKeys('yo yo yo', Key.ENTER);
input.sendKeys('yo yo yo', Key.ENTER);
input.sendKeys('yo yo yo', Key.ENTER);
input.sendKeys('yo yo yo', Key.ENTER);
input.sendKeys('yo yo yo', Key.ENTER);

// driver.wait(until.titleIs('webdriver - Googles Search'), 50000);
// driver.quit();
