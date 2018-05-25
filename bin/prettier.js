const path = require("path");
const spawn = require("child_process").spawn;

const isWindows = /^win/.test(process.platform);
const prettierCmd = path.resolve(
  __dirname,
  `../node_modules/.bin/${isWindows ? "pretty-quick.cmd" : "pretty-quick"}`
);

const args = [
  "--trailing-comma=none",
  "--bracket-spacing=true",
  "--write",
  "*.js",
  "*.json",
  "packages/**/src/*.js",
  "src/*.js",
  "src/*/*.js",
  "src/components/**/*.css",
  "src/test/mochitest/*.js",
  "src/test/mochitest/!(examples)/**/*.js"
];

const prettierArgs = process.argv.slice(2).concat(args);

const prettierProc = spawn(prettierCmd, prettierArgs);

prettierProc.stdout.on("data", data => console.log(`${data}`));
prettierProc.stderr.on("data", data => console.log(`stderr: ${data}`));
prettierProc.on("close", code =>
  console.log(`prettier ${code === 0 ? "succeeded" : "failed"}`)
);
prettierProc.on("error", error => {
  if (error.code == "ENOENT") {
    console.log(`Hmm, could not find the path ${cmd}.`);
    return;
  }
  console.log(error);
});
