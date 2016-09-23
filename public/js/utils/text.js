// @flow

const { Services } = require("Services");

function cmdString(): string {
  return (Services.appinfo.OS === "Darwin") ? "⌘" : "Ctrl";
}

module.exports = {
  cmdString
};
