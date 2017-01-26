// MIT © Sindre Sorhus - sindresorhus.com
// via https://gist.github.com/sindresorhus/7996717

const execFile = require("child_process").execFile;

execFile("git diff-tree",
  ["-r", "--name-only", "--no-commit-id", "ORIG_HEAD", "HEAD"],
  (error, stdout, stderr) => {
  if (error) {
    console.error("stderr", stderr);
    throw error;
  }
  if (stdout.includes("yarn.lock")) {
    console.log("🎅 yarn.lock changed; RUN: yarn install");
  }
});
