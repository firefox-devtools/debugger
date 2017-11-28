#!/usr/bin/env node
const { spawn, exec } = require("child_process");
const fs = require("fs");
const args = process.argv.slice(2);

const keyRegex = new RegExp("--");
const conf = {};
args.reduce((currentConfigKey, arg) => {
  if (keyRegex.test(arg)) {
    const sanitizedArg = arg.replace("--", "");
    if (!conf[sanitizedArg]) {
      currentConfigKey = [];
      conf[sanitizedArg] = currentConfigKey;
      return currentConfigKey;
    }
  }
  currentConfigKey.push(arg);
  return currentConfigKey;
}, []);

function getCommits(from, to) {
  return new Promise((resolve, reject) => {
    exec("git log", (stderr, stdout, err) => {
      if (stdout) {
        const commitList = stdout
          .match(/(commit\s\S*)/g)
          .map(str => str.replace("commit ", ""));

        if (!from && !to) {
          resolve([commitList[0]]);
        }
        if (from && !to) {
          const lastIndex = commitList.indexOf(from);
          const commits = commitList.slice(0, lastIndex);
          resolve(commits);
        }
        if (from && to) {
          const firstIndex = commitList.indexOf(to);
          const lastIndex = commitList.indexOf(from);
          const commits = commitList.slice(firstIndex, lastIndex);
          resolve(commits);
        }
      }
    });
  });
}

function switchTo(commit) {
  console.log("switch to", commit);
  return new Promise((resolve, reject) => {
    exec(`git checkout ${commit}`, (stderr, stdout, err) => {
      return resolve("done");
    });
  });
}

function copyToTarget(commit) {
  console.log("copy target", commit);
  return new Promise((resolve, reject) => {
    exec("yarn copy-assets", (stderr, stdout, err) => {
      return resolve("done");
    });
  });
}

function saveFile(commit, saveLocation) {
  console.log("save file", commit);
  return new Promise((resolve, reject) => {
    exec(
      `cp ${saveLocation} ./damp/.tmp/${commit}.json`,
      (stderr, stdout, err) => {
        return resolve("done");
      }
    );
  });
}

function reduceStrings(strings, initial) {
  return strings.reduce(
    (string, substring) => `${string}
    ${substring}`,
    initial
  );
}

async function runProcess(config) {
  const command = `${config.target}/mach`;
  let localJSON = "";

  const argsTalos = [
    "talos-test",
    "--activeTests",
    "damp",
    "--subtests",
    config.tool
  ];

  let commits = config.commits;
  if (!commits) {
    commits = await getCommits(config.from, config.to);
  }

  function runDamp(commit) {
    return new Promise(async (resolve, reject) => {
      const doneSwitch = await switchTo(commit);
      console.log(doneSwitch);
      const doneCopy = await copyToTarget(commit);
      console.log(doneCopy);

      console.log(`starting...${commit}`);
      const damp = spawn(command, argsTalos);
      damp.on("exit", async code => {
        console.log(code.toString());
        const saved = await saveFile(commit, localJSON);
        console.log("save", saved);
        console.log("DONE");
        resolve();
      });
      damp.stderr.on("data", data => {
        if (!localJSON) {
          const match = data.toString().match(/Results are in (\S*)/);
          if (match) {
            localJSON = match[1].replace("['", "").replace("']", "");
          }
        }
        console.log(data.toString());
      });
    });
  }

  for (const commit of commits) {
    await runDamp(commit);
  }

  const results = commits.map(commit => {
    const commitData = JSON.parse(
      fs.readFileSync(`./damp/.tmp/${commit}.json`, "utf8")
    );
    commitData.commitHash = commit;
    return commitData;
  });

  const output = results.map(result => {
    const subtests = result.suites[0].subtests;
    const strings = subtests.map(subtest => {
      const { name, value, unit } = subtest;
      return `${name}: ${value}${unit}`;
    });

    return reduceStrings(
      strings,
      `\ntest result averages for ${result.commitHash}:`
    );
  });

  console.log(reduceStrings(output, "\n\n"));
}

runProcess(conf);
