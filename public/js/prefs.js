/* eslint max-len: [2, 90] */
"use strict";

const { PrefsHelper } = require("ff-devtools-libs/client/shared/prefs");

/**
 * Shortcuts for accessing various debugger preferences.
 */
let Prefs = new PrefsHelper("devtools", {
  workersAndSourcesWidth: ["Int", "debugger.ui.panes-workers-and-sources-width"],
  instrumentsWidth: ["Int", "debugger.ui.panes-instruments-width"],
  panesVisibleOnStartup: ["Bool", "debugger.ui.panes-visible-on-startup"],
  variablesSortingEnabled: ["Bool", "debugger.ui.variables-sorting-enabled"],
  variablesOnlyEnumVisible: ["Bool", "debugger.ui.variables-only-enum-visible"],
  variablesSearchboxVisible: ["Bool", "debugger.ui.variables-searchbox-visible"],
  pauseOnExceptions: ["Bool", "debugger.pause-on-exceptions"],
  ignoreCaughtExceptions: ["Bool", "debugger.ignore-caught-exceptions"],
  sourceMapsEnabled: ["Bool", "debugger.source-maps-enabled"],
  prettyPrintEnabled: ["Bool", "debugger.pretty-print-enabled"],
  autoPrettyPrint: ["Bool", "debugger.auto-pretty-print"],
  workersEnabled: ["Bool", "debugger.workers"],
  editorTabSize: ["Int", "editor.tabsize"],
  autoBlackBox: ["Bool", "debugger.auto-black-box"],
  promiseDebuggerEnabled: ["Bool", "debugger.promise"]
});

module.exports = Prefs;
