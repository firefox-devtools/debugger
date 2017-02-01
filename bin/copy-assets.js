const { tools: { makeBundle, symlinkTests, copyFile }} = require("devtools-launchpad/index");
const path = require("path");
const minimist = require("minimist");

const feature = require("devtools-config");
const getConfig = require("./getConfig");

const envConfig = getConfig();
feature.setConfig(envConfig);

const args = minimist(process.argv.slice(2), {
  boolean: ["watch", "symlink"],
  string: ["mc"]
});

const shouldSymLink = args.symlink

function start() {
  console.log("start: copy assets")
  const projectPath = path.resolve(__dirname, "..")
  const mcModulePath =  "devtools/client/debugger/new";
  const mcPath = args.mc ? args.mc : feature.getValue("firefox.mcPath");

  copyFile(
    path.join(projectPath, "./assets/panel/debugger.properties"),
    path.join(projectPath, mcPath, "/devtools/client/locales/en-US/debugger.properties"),
    {cwd: projectPath}
  );

  copyFile(
    path.join(projectPath, "./assets/panel/prefs.js"),
    path.join(projectPath, mcPath, "devtools/client/preferences/devtools.js"),
    {cwd: projectPath}
  );

  copyFile(
    path.join(projectPath, "./assets/panel/index.html"),
    path.join(projectPath, mcPath, "devtools/client/debugger/new/index.html"),
    {cwd: projectPath}
  );

  copyFile(
    path.join(projectPath, "./assets/panel/panel.js"),
    path.join(projectPath, mcPath, "devtools/client/debugger/new/panel.js"),
    {cwd: projectPath}
  );

  copyFile(
    path.join(projectPath, "./assets/panel/moz.build"),
    path.join(projectPath, mcPath, "devtools/client/debugger/new/moz.build"),
    {cwd: projectPath}
  );

  if (shouldSymLink) {
    symlinkTests({ projectPath, mcModulePath })
  } else {
    copyFile(
      path.resolve(projectPath, "src/test/mochitest"),
      path.join(projectPath, mcPath, mcModulePath, "test/mochitest"),
      { cwd: projectPath }
    );
  }

  makeBundle({
    outputPath: path.join(projectPath, mcPath, mcModulePath),
    projectPath,
    watch: args.watch
  }).then(() => {
    console.log("done: copy assets")
  });
}

start();
