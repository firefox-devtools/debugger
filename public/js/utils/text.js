// @flow

const { Services } = require("devtools-modules");

function cmdString(): string {
  return (Services.appinfo.OS === "Darwin") ? "⌘" : "Ctrl";
}

module.exports = {
  cmdString
};
