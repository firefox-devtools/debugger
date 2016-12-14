const { tools: { makeBundle, symlinkTests, copyFile }} = require("devtools-launchpad/index");
const path = require("path");
const minimist = require("minimist");

const feature = require("devtools-config");
const getConfig = require("./getConfig");

const envConfig = getConfig();
feature.setConfig(envConfig);

const args = minimist(process.argv.slice(2), {
  boolean: ["watch"],
});

function start() {
  console.log("start: copy assets")
  const projectPath = path.resolve(__dirname, "..")
  const mcModulePath =  "devtools/client/debugger/new";
  const mcPath = feature.getValue("firefox.mcPath");

  copyFile(
    path.resolve(projectPath, "assets/locales/debugger.properties"),
    path.resolve(projectPath, "firefox/devtools/client/locales/en-US/debugger.properties"),
    {cwd: projectPath}
  );

  symlinkTests({ projectPath, mcModulePath })

  makeBundle({
    outputPath: path.join(projectPath, mcPath, mcModulePath),
    projectPath,
    watch: args.watch
  }).then(() => {
    console.log("done: copy assets")
  });
}

start();
