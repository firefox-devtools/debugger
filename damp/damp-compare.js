#!/usr/bin/env node
const fs = require("fs");
const args = process.argv.slice(2);

const results = args.map(commit => {
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

function reduceStrings(strings, initial) {
  return strings.reduce(
    (string, substring) => `${string}
    ${substring}`,
    initial
  );
}
console.log(reduceStrings(output, "\n\n"));
