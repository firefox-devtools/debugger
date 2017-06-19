const path = require("path");
const spawn = require("child_process").spawn;

const isWindows = /^win/.test(process.platform);
const prettierCmd = path.resolve(
  __dirname,
  `../node_modules/.bin/${isWindows ? "prettier.cmd" : "prettier"}`
);

const args = [
  "--trailing-comma=none",
  "--bracket-spacing=true",
  "--write",
  "*.js",
  "src/*.js",
  "src/*/*.js",
  "src/components/**/*.css",
  "src/*/!(mochitest)**/*.js",
  "src/*/!(mochitest)*/**/*.js"
];

const prettierArgs = process.argv.slice(2).concat(args);

const prettierProc = spawn(prettierCmd, prettierArgs);

prettierProc.stdout.on("data", data => console.log(`${data}`));
prettierProc.stderr.on("data", data => console.log(`stderr: ${data}`));
prettierProc.on("close", code =>
  console.log(`prettier exited with code ${code}`)
);
prettierProc.on("error", error => {
  if (error.code == "ENOENT") {
    console.log(`Hmm, could not find the path ${cmd}.`);
    return;
  }
  console.log(error);
});
