const {
  tools: { makeBundle, symlinkTests, copyFile }
} = require("devtools-launchpad/index");
const path = require("path");
const minimist = require("minimist");
var fs = require("fs");
var fsExtra = require("fs-extra");
const rimraf = require("rimraf");

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

function searchText(text, regexp) {
  let matches = [];
  let match;
  do {
    match = regexp.exec(text);
    if (match) {
      matches.push(match[1]);
    }
  } while (match);

  return matches;
}

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });

  return filelist;
};

function copySVGs({ projectPath, mcPath }) {
  /*
   * Copying SVGs
   * We want to copy the SVGs that we include in our CSS into the
   * MC devtools/client/themes directory. To do this, we look for the
   * SVGs that are inlcuded in our CSS files and then copy the files
   * and include them in the jar.mn file
   */

  const projectImagesPath = path.join(projectPath, "assets/images/");
  const mcImagesPath = path.join(
    mcPath,
    "devtools/client/themes/images/debugger"
  );

  let usedSvgs = [];
  const svgTest = new RegExp(/url\(\/images\/(.*)\)/, "g");
  const cssFiles = walkSync(path.join(projectPath, "src/components"))
    .filter(file => file.match(/css$/))
    .forEach(file =>
      usedSvgs.push(...searchText(fs.readFileSync(file, "utf-8"), svgTest))
    );

  const files = fs
    .readdirSync(projectImagesPath)
    .filter(file => file.match(/svg$/))
    .filter(file => usedSvgs.includes(file));

  rimraf.sync(mcImagesPath);
  files.forEach(file =>
    fsExtra.copySync(
      path.join(projectImagesPath, file),
      path.join(mcImagesPath, `${file}`)
    )
  );

  const newText =
    files
      .map(
        file =>
          `    skin/images/debugger/${file} (themes/images/debugger/${file})`
      )
      .join("\n") + "\n";

  const mcJarPath = path.join(mcPath, "devtools/client/jar.mn");
  updateFile(mcJarPath, text => {
    const newJar = text.replace(
      /(.*skin\/images\/debugger\/.*$\n)+/gm,
      newText
    );
    return newJar;
  });
}

function copyTests({ mcPath, projectPath, mcModulePath, shouldSymLink }) {
  const projectTestPath = path.join(projectPath, "src/test/mochitest");
  const mcTestPath = path.join(mcPath, mcModulePath, "test/mochitest");
  if (shouldSymLink) {
    symlinkTests({ projectPath, mcTestPath, projectTestPath });
  } else {
    // we should rm the test dir first
    rimraf.sync(mcTestPath);
    copyFile(projectTestPath, mcTestPath, { cwd: projectPath });
  }
}

function copyWithReplace(source, target, { cwd }, what, replacement) {
  if (cwd) {
    source = path.resolve(cwd, source);
    target = path.resolve(cwd, target);
  }
  const content = fs.readFileSync(source).toString();
  const replaced = content.replace(what, replacement);
  fs.writeFileSync(target, replaced);
}

function copyWasmParser({ mcPath, projectPath }) {
  copyWithReplace(
    require.resolve("wasmparser/dist/WasmParser.js"),
    path.join(mcPath, "devtools/client/shared/vendor/WasmParser.js"),
    { cwd: projectPath },
    /^\/\/# sourceMappingURL=[^\n]*/m,
    ""
  );

  copyWithReplace(
    require.resolve("wasmparser/dist/WasmDis.js"),
    path.join(mcPath, "devtools/client/shared/vendor/WasmDis.js"),
    { cwd: projectPath },
    /^\/\/# sourceMappingURL=[^\n]*/m,
    ""
  );

  const wasmparserPackageLocation = require.resolve("wasmparser/package.json");
  const wasmparserVersion = JSON.parse(
    fs.readFileSync(wasmparserPackageLocation).toString()
  ).version;
  copyWithReplace(
    path.join(projectPath, "./assets/panel/WASMPARSER_UPGRADING"),
    path.join(mcPath, "devtools/client/shared/vendor/WASMPARSER_UPGRADING"),
    { cwd: projectPath },
    /\$\(WASMPARSER_VERSION\)/g,
    wasmparserVersion
  );
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

  const config = { shouldSymLink, mcPath, projectPath, mcModulePath };

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

  copySVGs(config);
  copyTests(config);
  copyWasmParser(config);
  writeReadme(path.join(mcPath, "devtools/client/debugger/new/README.mozilla"));

  const debuggerPath = "devtools/client/debugger/new"

  rimraf.sync(path.join(
    mcPath,
    debuggerPath,
    "test/mochitest/examples/babel/source-maps-semantics.md"
  ));


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
