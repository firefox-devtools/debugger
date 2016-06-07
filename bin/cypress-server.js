"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');

/**
 saves a fixture file to public/js/test/fixtures

 @param name - name of the fixture file
 @param text - fixture json text
*/
function saveFixture(name, text) {
  function getFixtureFile(name) {
    const fixturePath = path.join(__dirname, "../public/js/test/fixtures");
    const fixtureFile = path.join(fixturePath, name + ".json");
    if (!fs.existsSync(fixturePath)) {
      throw new Error("Could not find fixture " + name);
    }

    return fixtureFile;
  }

  const fixtureFile = getFixtureFile(name);
  fs.writeFileSync(fixtureFile, text)
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));

app.post("/save-fixture", function(req, res) {
  const fixtureName = req.body.fixtureName;
  const fixtureText = req.body.fixtureText;
  saveFixture(fixtureName, fixtureText);

  res.send(`saved fixture ${fixtureName}`);
});

app.listen(8001, "localhost", function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Development Server Listening at http://localhost:8001");
});
