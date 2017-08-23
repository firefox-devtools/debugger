const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

// const minimist = require("minimist");

const blacklist = [
  "^s*$",
  '^"}]',
  "Unknown property",
  "Error in parsing value",
  "Unknown pseudo-class",
  "unreachable code",
  "runtests\\.py",
  "MochitestServer",
  "Main app process",
  "launched child process",
  "zombiecheck",
  "Stopping web server",
  "Stopping web socket server",
  "Stopping ssltunnel",
  "leakcheck",
  "Buffered messages",
  "Browser Chrome Test Summary",
  "Buffered messages finished",
  "CFMessagePort",
  "Completed ShutdownLeaks",
  "SUITE-END",
  "failed to bind",
  "Use of nsIFile in content process is deprecated.",
  "could not create service for entry 'OSX Speech Synth'",
  "The character encoding of the HTML document was not declared.",
  "This site appears to use a scroll-linked positioning effect",
  "Entering test bound",
  "Shutting down...",
  "Leaving test bound",
  "MEMORY STAT",
  "TELEMETRY PING",
  "started process",
  "bootstrap_defs.h",
  "Listening on port",
  "Removing tab.",
  "Tab removed and finished closing",
  "TabClose",
  "checking window state",
  "Opening the toolbox",
  "Toolbox opened and focused",
  "Tab added and finished loading"
];

function sanitizeLine(line) {
  return line.trim().replace(/\\"/g, '"').replace(/\\"/g, '"');
}

function onFrame(line, data) {
  const [, fnc, _path, _line, column] = line.match(/(.*)@(.*):(.*):(.*)/);
  const file = path.basename(_path);
  return `   ${fnc} ${chalk.dim(`${file} ${_line}:${column}`)}`;
}

function onGecko(line, data) {
  const [, msg] = line.match(/^GECKO.*?\|(.*)$/);

  if (data.mode == "starting") {
    return;
  }

  if (line.match(/\*{5,}/)) {
    data.mode = data.mode == "gecko-error" ? null : "gecko-error";
    return;
  }

  if (data.mode == "gecko-error") {
    return;
  }

  if (line.includes("console.error")) {
    data.mode = "console-error";
    return `  ${chalk.red("Console Error")}`;
  }

  if (data.mode == "console-error") {
    if (line.includes("Handler function")) {
      return;
    }

    if (line.match(/@/)) {
      const newMsg = msg.match(/Stack:/) ? msg.match(/Stack:(.*)/)[1] : msg;
      return onFrame(newMsg);
    } else {
      data.mode = null;
    }
  }

  return msg;
}

function onDone(line) {
  if (line.includes("TEST-UNEXPECTED-FAIL")) {
    const [, file] = line.match(/.*\|(.*?)\|.*/);
    return `${chalk.red("failed test")}: ${file}`;
  }

  return;
}

function onLine(line, data) {
  line = sanitizeLine(line);

  if (line.match(new RegExp(`(${blacklist.join("|")})`))) {
    return;
  }

  if (data.mode == "done") {
    return onDone(line);
  }

  if (data.mode == "stack-trace") {
    if (line.match(/@/)) {
      return onFrame(line);
    } else {
      data.mode = null;
      return "\n";
    }
  }

  if (line.includes("End BrowserChrome Test Results")) {
    data.mode = "done";
    return;
  }

  if (line.match(/TEST-/)) {
    return onTestInfo(line, data);
  }

  if (line.match(/INFO/)) {
    return onInfo(line, data);
  }

  if (line.match(/GECKO\(/)) {
    return onGecko(line, data);
  }

  if (line.match(/Console message/)) {
    return onConsole(line, data);
  }

  if (line.includes("Stack trace")) {
    data.mode = "stack-trace";
    return `\n  ${chalk.bold("Stack trace")}`;
  }

  if (data.mode != "starting") {
    return `${line}`;
  }
}

function onTestInfo(line, data) {
  const res = line.match(/(TEST-[A-Z-]*).* \| (.*\.js)( \| (.*))?$/);

  if (!res) {
    return line.trim();
  }

  const [, type, _path, , msg] = res;

  if (type == "TEST-PASS") {
    return ` ${chalk.cyan(type)} ${msg}`;
  }

  const file = path.basename(_path);

  if (type == "TEST-UNEXPECTED-FAIL") {
    const [, errorPath, error] = msg.match(/(.*)-(.*)/);
    const errorFile = path.basename(errorPath);

    return ` ${chalk.red(type)} ${errorFile}\n${chalk.yellow(error)}`;
  }

  let prefix = type == "TEST-OK" ? chalk.green(type) : chalk.blue(type);

  return `${prefix} ${file}`;
}

function onInfo(line, data) {
  const [, msg] = line.match(/.*INFO(.*)$/);

  if (
    msg.includes("Start BrowserChrome Test Results") &&
    data.mode == "starting"
  ) {
    data.mode = null;
    return;
  }

  if (data.mode == "starting") {
    return;
  }

  if (msg.match(/(Passed|Failed|Todo|Mode):/)) {
    const [, type, , val] = msg.match(/((Passed|Failed|Todo|Mode)):(.*)/);
    return `${chalk.blue(type)}: ${val.trim()}`;
  }

  return `  ${msg}`;
}

function onConsole(line, data) {
  if (line.match(/JavaScript Warning/)) {
    const res = line.match(/^.*JavaScript Warning: (.*)$/);
    if (!res) {
      return line;
    }

    const [, msg, data] = res;

    const err = data;
    return `  ${chalk.red("JS warning: ")}${msg}`;
  }

  return line; //
}

function readOutput(text) {
  let data = { mode: "starting" };
  const out = text.split("\n").map(line => onLine(line, data)).filter(i => i);
  return out;
}

async function startWebpack() {
  console.log(chalk.blue("Starting webpack"));

  const command = path.resolve(__dirname, "copy-assets.js");
  const child = shell.exec(`node ${command} --watch --symlink`, {
    async: true,
    silent: true
  });

  return new Promise(resolve => {
    child.on.stdout(data => {
      const isDone = data.includes("done");
      if (isDone) {
        console.log(chalk.blue("webpack is done building"));
        resolve();
      }
    });
  });
}

function runMochitests(args) {
  shell.cd("firefox");
  const command = `./mach mochitest ${args.join(" ")}`;
  console.log(chalk.blue(command));

  const child = shell.exec(
    command,
    {
      async: true,
      silent: true
    },
    code => shell.exit(code)
  );

  let testData = { mode: "starting" };

  child.stdout.on("data", function(data) {
    data = data.trim();
    const lines = data.split("\n").forEach(line => {
      const out = onLine(line.trim(), testData);
      if (out) {
        console.log(out);
      }
    });
  });
}

async function run(args) {
  if (!shell.test("-d", "firefox")) {
    const url = `https://github.com/devtools-html/debugger.html/blob/master/docs/mochitests.md`;
    console.log(
      chalk.red("Oops"),
      `looks like Firefox does not exist.\nVisit our setup instructions: ${url}`
    );
    return;
  }

  // TODO: it would be nice to automate the full workflow so users can
  // run one test and then be able to kill the run and re-run. kinda like jest --watch
  // await startWebpack()

  runMochitests(args);
}

/*
 * updateArgs is a small convenience method for determining which tests to run
 * if there are no args, include all the tests
 * if there is no browser_dbg prefix, add it.
 */
function updateArgs(args) {
  if (args.length == 0) {
    return ["devtools/client/debugger/new"];
  }

  const _args = args.slice(0, -1);
  const maybeFile = args[args.length - 1];
  const hasFile = maybeFile && !maybeFile.includes("/");

  if (!hasFile) {
    return args;
  }

  const file = maybeFile;
  if (file.includes("browser_dbg")) {
    return args;
  }

  const newFile = `browser_dbg-${file}`;
  return [..._args, newFile];
}

if (process.mainModule.filename.includes("bin/mochi.js")) {
  let args = process.argv[0].includes("bin/node")
    ? process.argv.slice(2)
    : process.argv;

  if (args[0] == "--read") {
    const file = args[1];
    const _path = path.join(__dirname, "..", file);
    const text = fs.readFileSync(_path, { encoding: "utf8" });
    console.log(readOutput(text).join("\n"));
  } else {
    args = updateArgs(args);
    run(args);
  }
}

module.exports = { run, readOutput };
