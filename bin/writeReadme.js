const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;

function getGitSha() {
  return new Promise((resolve, reject) => {
    const proc = spawn("git", ["log", "--format=%H", "-n", "1"]);

    let version = "";

    proc.stdout.on("data", data => {
      version += data;
    });
    proc.on("close", code => resolve(version.trim()));
    proc.on("error", error => {
      if (error.code == "ENOENT") {
        reject(new Error("Could not find git."));
        return;
      }
      reject(error);
    });
  });
}

function getPackageVersion(name) {
  try {
    const json = require(`${name}/package.json`);
    const { version } = json;
    return { name, version };
  } catch (ex) {
    return { name, version: "n/a" };
  }
}

const packageOfInterest = [
  "babel-plugin-transform-es2015-modules-commonjs",
  "babel-preset-react",
  "react",
  "react-dom",
  "webpack"
];

function getInterestingPackagesVersions() {
  return Promise.all(packageOfInterest.map(p => getPackageVersion(p)));
}

async function writeReadme(target) {
  const readmeText = fs.readFileSync(target, "utf8");
  const packagesVersions = await getInterestingPackagesVersions();

  const packageText = packagesVersions
    .map(({ name, version }) => `- ${name} @${version}`)
    .join("\n")

  const newText = readmeText.replace(/(Packages:\n)(.|\n)*/m, `$1${packageText}\n`)

  fs.writeFileSync(target, newText);
}

module.exports = writeReadme;
