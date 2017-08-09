const shell = require("shelljs");
const chalk = require("chalk");
const path = require("path");

// const minimist = require("minimist");

const blacklist = [
  "^s*$",
  "^###.*",
  '^"}]',
  "pk12util",
  "GECKO\\(",
  "Unknown property",
  "Error in parsing value",
  "Unknown pseudo-class",
  "unreachable code",
  "runtests\\.py",
  "MochitestServer",
  "Main app process",
  "Application command",
  "launched child process",
  "zombiecheck",
  "Stopping web server",
  "Stopping web socket server",
  "Stopping ssltunnel",
  "leakcheck",
  "Buffered messages",
  "Browser Chrome Test Summary",
  "End BrowserChrome Test Results",
  "Buffered messages finished",
  "SUITE-END",
  "failed to bind",
  "Use of nsIFile in content process is deprecated.",
  "could not create service for entry 'OSX Speech Synth'",
  "The character encoding of the HTML document was not declared.",
  "This site appears to use a scroll-linked positioning effect",
  "Entering test bound",
  "Checking for orphan ssltunnel",
  "Checking for orphan xpcshell processes...",
  "Shutting down...",
  "Leaving test bound",
  "Removing tab.",
  "Tab removed and finished closing",
  "TabClose",
  "ttys001",
  "SUITE-START",
  "^dir:",
  "Start BrowserChrome",
  "checking window state",
  "Opening the toolbox",
  "Toolbox opened and focused",
  "Tab added and finished loading"
];

function sanitizeLine(line) {
  return line.trim().replace(/\\"/g, '"').replace(/\\"/g, '"');
}

function onLine(line) {
  line = sanitizeLine(line);
  if (line.match(new RegExp(`(${blacklist.join("|")})`))) {
    return;
  }

  if (line.match(/TEST-/)) {
    return onTestInfo(line);
  }

  if (line.match(/INFO/)) {
    return onInfo(line);
  }

  if (line.match(/Console message/)) {
    return onConsole(line);
  }

  return `${line}`;
}

function onTestInfo(line) {
  const res = line.match(/(TEST-[A-Z-]*).* \| (.*\.js)( \| (.*))?$/);

  if (!res) {
    return line.trim();
  }

  const [, type, _path, msg] = res;

  if (type == "TEST-PASS") {
    return ` ${chalk.cyan(type)} ${msg}`;
  }

  const file = path.basename(_path);

  let prefix =
    type == "TEST-OK"
      ? chalk.green(type)
      : type == "TEST-UNEXPECTED-FAURE" ? chalk.red(type) : chalk.blue(type);

  return `${prefix} ${file}`;
}

function onInfo(line) {
  const res = line.match(/.*INFO(.*)$/);

  if (!res) {
    return;
  }

  const [, msg] = res;

  if (line.match(/(Passed|Failed|Todo|Mode|Shutdown)/)) {
    return;
  }

  return `  ${msg}`;
}

function onConsole(line) {
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
  const out = text.split("\n").map(line => onLine(line)).filter(i => i);
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

function runMochitests() {
  shell.cd("firefox");
  const command = `./mach mochitest ${args.join(" ")}`;
  console.log(chalk.blue(command));

  const child = shell.exec(command, {
    async: true,
    silent: true
  });

  child.stdout.on("data", function(data) {
    data = data.trim();
    const lines = data.split("\n").forEach(line => {
      const out = onLine(line.trim());
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

  runMochitests();
}

if (process.mainModule.filename.includes("bin/mochi.js")) {
  let args = process.argv[0].includes("bin/node")
    ? process.argv.slice(2)
    : process.argv;

  if (args.length == 0) {
    args = ["devtools/client/debugger/new"];
  }

  run(args);
}

module.exports = { run, readOutput };
