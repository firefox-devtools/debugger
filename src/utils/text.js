// @flow

/**
 * Utils for keyboard command strings
 * @module utils/text
 */

const { Services: { appinfo }} = require("devtools-modules");

/**
 * @memberof utils/text
 * @static
 */
function cmdString(): string {
  return (appinfo.OS === "Darwin") ? "⌘" : "Ctrl";
}

module.exports = {
  cmdString
};
