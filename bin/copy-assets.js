const {
  tools: { makeBundle, symlinkTests, copyFile }
} = require("devtools-launchpad/index");
const path = require("path");
const minimist = require("minimist");
var fs = require("fs");
var fsExtra = require("fs-extra");

const feature = require("devtools-config");
const getConfig = require("./getConfig");
const writeReadme = require("./writeReadme");

const envConfig = getConfig();
feature.setConfig(envConfig);

const args = minimist(process.argv.slice(2), {
  boolean: ["watch", "symlink", "assets"],
  string: ["mc"]
});

const shouldSymLink = args.symlink;
const updateAssets = args.assets;
const watch = args.watch;

function updateFile(filename, cbk) {
  var text = fs.readFileSync(filename, "utf-8");
  fs.writeFileSync(filename, cbk(text), "utf-8");
}

function start() {
  console.log("start: copy assets");
  const projectPath = path.resolve(__dirname, "..");
  const mcModulePath = "devtools/client/debugger/new";
  let mcPath = args.mc ? args.mc : feature.getValue("firefox.mcPath");

  process.env.NODE_ENV = "production";

  // resolving against the project path in case it's relative. If it's absolute
  // it will override whatever is in projectPath.
  mcPath = path.resolve(projectPath, mcPath);

  copyFile(
    path.join(projectPath, "./assets/panel/debugger.properties"),
    path.join(mcPath, "devtools/client/locales/en-US/debugger.properties"),
    { cwd: projectPath }
  );

  copyFile(
    path.join(projectPath, "./assets/panel/prefs.js"),
    path.join(mcPath, "devtools/client/preferences/debugger.js"),
    { cwd: projectPath }
  );

  copyFile(
    path.join(projectPath, "./assets/panel/index.html"),
    path.join(mcPath, "devtools/client/debugger/new/index.html"),
    { cwd: projectPath }
  );

  copyFile(
    path.join(projectPath, "./assets/panel/panel.js"),
    path.join(mcPath, "devtools/client/debugger/new/panel.js"),
    { cwd: projectPath }
  );

  copyFile(
    path.join(projectPath, "./assets/panel/moz.build"),
    path.join(mcPath, "devtools/client/debugger/new/moz.build"),
    { cwd: projectPath }
  );

  const projectTestPath = path.join(projectPath, "src/test/mochitest");
  const mcTestPath = path.join(mcPath, mcModulePath, "test/mochitest");
  if (shouldSymLink) {
    symlinkTests({ projectPath, mcTestPath, projectTestPath });
  } else {
    // we should rm the test dir first
    copyFile(projectTestPath, mcTestPath, { cwd: projectPath });
  }

  const projectImagesPath = path.join(projectPath, "assets/images/");
  const mcImagesPath = path.join(mcPath, "devtools/client/themes/images/debugger");

  const files = fs.readdirSync(projectImagesPath)
    .filter(file => file.match(/svg$/))

  files
    .forEach(file =>
        fsExtra.copySync(
          path.join(projectImagesPath, file),
          path.join(mcImagesPath, `${file}`)
        )
      )


  const newText = files
    .map(file => `    skin/images/debugger/${file} (themes/images/debugger/${file})`)
    .join("\n") + '\n'

  const mcJarPath = path.join(mcPath, "devtools/client/jar.mn");
  updateFile(mcJarPath, text => {
    const newJar = text.replace(/(.*skin\/images\/debugger\/.*$\n)+/mg, newText)
    return newJar;
  });


  writeReadme(path.join(mcPath, "devtools/client/debugger/new/README.mozilla"));

  makeBundle({
    outputPath: path.join(mcPath, mcModulePath),
    projectPath,
    watch,
    updateAssets
  })
    .then(() => {
      console.log("done: copy assets");
    })
    .catch(err => {
      console.log(
        "Uhoh, something went wrong. The error was written to assets-error.log"
      );
      fs.writeFileSync("assets-error.log", JSON.stringify(err, null, 2));
    });
}

start();
