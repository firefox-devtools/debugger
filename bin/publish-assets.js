const { tools: { makeBundle, symlinkTests, copyFile }} = require("devtools-launchpad/index");
const path = require("path");
const fs = require("fs");

function start() {
  console.log("start: publish assets")
  const projectPath = path.resolve(__dirname, "..")
  const mcModulePath =  "devtools/client/debugger/new";

  const buildDir = path.resolve(projectPath, "assets/build");
  const assetsDir = path.resolve(projectPath, "assets");

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(assetsDir);
    fs.mkdirSync(buildDir);
  }

  copyFile(
    path.resolve(projectPath, "assets/locales/debugger.properties"),
    path.resolve(projectPath, "assets/build/debugger.properties"),
    {cwd: projectPath}
  );

  copyFile(
    path.resolve(projectPath, "assets/default-prefs.js"),
    path.resolve(projectPath, "assets/build/default-prefs.js"),
    {cwd: projectPath}
  );

  copyFile(
    path.resolve(projectPath, "src/test/mochitest"),
    path.resolve(projectPath, "assets/build/mochitest"),
    { cwd: projectPath }
  );

  makeBundle({
    outputPath: `${projectPath}/assets/build`,
    projectPath
  }).then(() => {
    console.log("done: publish assets")
  })

}

start();
