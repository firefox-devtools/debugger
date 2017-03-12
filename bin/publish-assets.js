const { tools: { makeBundle, symlinkTests, copyFile }} = require("devtools-launchpad/index");
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");

function start() {
  console.log("start: publish assets")
  const projectPath = path.resolve(__dirname, "..")
  const mcModulePath =  "devtools/client/debugger/new";

  const buildDir = path.resolve(projectPath, "assets/build");
  const assetsDir = path.resolve(projectPath, "assets");

  if (fs.existsSync(buildDir)) {
    rimraf(buildDir);
  }
  fs.mkdirSync(buildDir);

  copyFile(
    path.resolve(projectPath, "assets/panel"),
    path.join(projectPath, "assets/build/panel"),
    { cwd: projectPath }
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
