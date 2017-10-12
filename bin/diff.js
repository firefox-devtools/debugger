const exec = require("child_process").exec;
const ncp = require("copy-paste");
function diff() {
  exec("git diff", (err, gitDiff) => {
    if (err) {
      console.error(err)
    } else {
      ncp.copy("\`\`\`diff\n" + gitDiff + "\`\`\`", () => {
        console.log("copied diff to clipboard");
      });
    }
  });
}

diff();
