const { tools: { makeBundle, symlinkTests, copyFile }} = require("devtools-launchpad/index");
const path = require("path");

function start() {
  console.log("start: publish assets")
  const projectPath = path.resolve(__dirname, "..")
  const mcModulePath =  "devtools/client/debugger/new";

  copyFile(
    path.resolve(projectPath, "assets/locales/debugger.properties"),
    path.resolve(projectPath, "assets/build/debugger.properties"),
    {cwd: projectPath}
  );

  copyFile(
    path.resolve(projectPath, "src/test/mochitest"),
    path.resolve(projectPath, "assets/build"),
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
