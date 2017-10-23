const rimraf = require("rimraf");
const spawn = require("child_process").spawn;

function start() {
  console.log("Deleting node_modules and yarn.lock");
  rimraf("{node_modules,yarn.lock}", {}, () => {
    console.log("Reinstalling packages");
    spawn("yarn install", { shell: true, stdio: "inherit" });
  });
}

start();
