// @flow

const { Services: { appinfo }} = require("devtools-modules");

function cmdString(): string {
  return (appinfo.OS === "Darwin") ? "⌘" : "Ctrl";
}

module.exports = {
  cmdString
};
