"use strict";

const fs = require("fs");
const glob = require("glob").sync;
const path = require("path");

const getConfig = require("../config/config").getConfig;
const feature = require("../config/feature");
const config = getConfig();
feature.setConfig(config);

const geckoDir = feature.getValue("firefox.geckoDir");
if (!geckoDir) {
  console.log("Set firefox.geckoDir in your local.json config.")
  exit();
}

glob("public/js/lib/devtools/**/*.js").forEach((debuggerFile) => {
  const geckoFilePath = path.join(
    geckoDir,
    path.relative("public/js/lib/", debuggerFile)
  );

  const fileText = fs.readFileSync(geckoFilePath, 'utf8');
  fs.writeFileSync(debuggerFile, fileText);
})
