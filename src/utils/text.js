// @flow

/**
 * Utils for keyboard command strings
 * @module utils/text
 */

const { Services: { appinfo } } = require("devtools-modules");
const isMacOS = appinfo.OS === "Darwin";

/**
 * Formats key for use in tooltips
 * For macOS we use the following unicode
 *
 * cmd ⌘ = \u2318
 * shift ⇧ – \u21E7
 * option (alt) ⌥ \u2325
 *
 * For Win/Lin this replaces CommandOrControl or CmdOrCtrl with Ctrl
 *
 * @memberof utils/text
 * @static
 */
function formatKeyShortcut(shortcut: string): string {
  if (isMacOS) {
    return shortcut
      .replace(/Shift\+/g, "\u21E7+")
      .replace(/Command\+|Cmd\+/g, "\u2318+")
      .replace(/CommandOrControl\+|CmdOrCtrl\+/g, "\u2318+")
      .replace(/Alt\+/g, "\u2325+");
  }
  return shortcut.replace(
    /CommandOrControl\+|CmdOrCtrl\+/g,
    `${L10N.getStr("ctrl")}+`
  );
}

module.exports = {
  formatKeyShortcut
};
