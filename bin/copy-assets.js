const {
  tools: { makeBundle, symlinkTests, copyFile }
} = require("devtools-launchpad/index");
const sourceMapAssets = require("devtools-source-map/assets");
const path = require("path");
const minimist = require("minimist");
var fs = require("fs");
var fsExtra = require("fs-extra");
const rimraf = require("rimraf");
const shell = require("shelljs");

const feature = require("devtools-config");
const getConfig = require("./getConfig");
const writeReadme = require("./writeReadme");

const envConfig = getConfig();
feature.setConfig(envConfig);

function moveFile(src, dest, opts) {
  if (!fs.existsSync(src)) {
    return;
  }

  copyFile(src, dest, opts);
  rimraf.sync(src);
}

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
  console.log("[copy-assets] copy SVGs");
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
  console.log("[copy-assets] copy tests");

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
  console.log("[copy-assets] copy wasm parser");
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
  console.log("[copy-assets] start");

  const projectPath = path.resolve(__dirname, "..");
  const mcModulePath = "devtools/client/debugger/new";

  process.env.NODE_ENV = "production";

  // resolving against the project path in case it's relative. If it's absolute
  // it will override whatever is in projectPath.
  mcPath = path.resolve(projectPath, mcPath);

  const config = { shouldSymLink, mcPath, projectPath, mcModulePath };

  console.log("[copy-assets] copy static assets:");
  console.log("[copy-assets] - properties");
  copyFile(
    path.join(projectPath, "./assets/panel/debugger.properties"),
    path.join(mcPath, "devtools/client/locales/en-US/debugger.properties"),
    { cwd: projectPath }
  );

  console.log("[copy-assets] - preferences");
  copyFile(
    path.join(projectPath, "./assets/panel/prefs.js"),
    path.join(mcPath, "devtools/client/preferences/debugger.js"),
    { cwd: projectPath }
  );

  console.log("[copy-assets] - index.html, index.js");
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

  console.log("[copy-assets] - moz.build");
  copyFile(
    path.join(projectPath, "./assets/panel/moz.build"),
    path.join(mcPath, "devtools/client/debugger/new/moz.build"),
    { cwd: projectPath }
  );

  // Ensure /dist path exists.
  const bundlePath = "devtools/client/debugger/new/dist";
  shell.mkdir("-p", path.join(mcPath, bundlePath));

  console.log("[copy-assets] - dist/moz.build");
  copyFile(
    path.join(projectPath, "./assets/panel/dist.moz.build"),
    path.join(mcPath, bundlePath, "moz.build"),
    { cwd: projectPath }
  );

  copySVGs(config);
  copyTests(config);
  copyWasmParser(config);
  writeReadme(path.join(mcPath, "devtools/client/debugger/new/README.mozilla"));

  const debuggerPath = "devtools/client/debugger/new"

  if (!mcPath.startsWith(projectPath)) {
    rimraf.sync(path.join(
      mcPath,
      debuggerPath,
      "test/mochitest/examples/babel/source-maps-semantics.md"
    ));
  }

  console.log("[copy-assets] make webpack bundles");
  return makeBundle({
    outputPath: path.join(mcPath, bundlePath),
    projectPath,
    watch,
    updateAssets,
    onFinish: () => onBundleFinish({mcPath, bundlePath, projectPath})
  })
    .then()
    .catch(err => {
      console.log("[copy-assets] Uhoh, something went wrong. " +
                  "The error was written to assets-error.log");

      fs.writeFileSync("assets-error.log", JSON.stringify(err, null, 2));
    });
}

function onBundleFinish({mcPath, bundlePath, projectPath}) {
  console.log("[copy-assets] delete debugger.js bundle");

  const debuggerPath = path.join(mcPath, bundlePath, "debugger.js")
  if (fs.existsSync(debuggerPath)) {
    fs.unlinkSync(debuggerPath)
  }

  console.log("[copy-assets] copy shared bundles to client/shared");
  moveFile(
    path.join(mcPath, bundlePath, "source-map-worker.js"),
    path.join(mcPath, "devtools/client/shared/source-map/worker.js"),
    {cwd: projectPath}
  );
  for (const filename of Object.keys(sourceMapAssets)) {
    moveFile(
      path.join(mcPath, bundlePath, "source-map-worker-assets", filename),
      path.join(mcPath, "devtools/client/shared/source-map/assets", filename),
      {cwd: projectPath}
    );
  }

  moveFile(
    path.join(mcPath, bundlePath, "source-map-index.js"),
    path.join(mcPath, "devtools/client/shared/source-map/index.js"),
    {cwd: projectPath}
  );

  moveFile(
    path.join(mcPath, bundlePath, "reps.js"),
    path.join(mcPath, "devtools/client/shared/components/reps/reps.js"),
    {cwd: projectPath}
  );

  moveFile(
    path.join(mcPath, bundlePath, "reps.css"),
    path.join(mcPath, "devtools/client/shared/components/reps/reps.css"),
    {cwd: projectPath}
  );

  console.log("[copy-assets] done");
}

const args = minimist(process.argv.slice(2), {
  boolean: ["watch", "symlink", "assets"],
  string: ["mc"]
});

let shouldSymLink = args.symlink;
let updateAssets = args.assets;
let watch = args.watch;
let mcPath = args.mc || feature.getValue("firefox.mcPath");


if (process.argv[1] == __filename) {
  start();
} else {
  module.exports = ({symlink, assets, watch: _watch, mc}) => {
    shouldSymLink = symlink;
    updateAssets = assets;
    watch = _watch
    mcPath = mc
    return start();
  }
}
