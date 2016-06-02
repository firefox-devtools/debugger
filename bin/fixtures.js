"use strict";

const fs = require('fs');
const path = require('path');

const fixturePath = path.join(__dirname, "../public/js/test/fixtures");

function saveFixture(name, text) {
  console.log("starting saveFixture")
  const fixtureFile = path.join(fixturePath, name + ".json");

  if (!fs.existsSync(fixturePath)) {
    throw new Error("Could not find fixture " + name);
  }

  console.log("writing file")
  fs.writeFileSync(fixtureFile, text)
  process.exit(0);
}

const shouldSave = process.argv.indexOf("--save") > -1;
let fixtureName = process.env.FIXTURE_NAME;
let fixtureText = process.env.FIXTURE_TEXT;

console.log("starting fixtures", shouldSave)
if (shouldSave) {
  saveFixture(fixtureName, fixtureText)
}
