// @flow

var { PrefsHelper } = require("devtools-modules");
const { Services: { pref } } = require("devtools-modules");
const { isDevelopment } = require("devtools-config");

if (isDevelopment()) {
  pref("devtools.debugger.client-source-maps-enabled", true);
  pref("devtools.debugger.pause-on-exceptions", false);
  pref("devtools.debugger.ignore-caught-exceptions", false);
  pref("devtools.debugger.call-stack-visible", false);
  pref("devtools.debugger.scopes-visible", false);
  pref("devtools.debugger.start-panel-collapsed", false);
  pref("devtools.debugger.end-panel-collapsed", false);
  pref("devtools.debugger.tabs", "[]");
  pref("devtools.debugger.ui.framework-grouping-on", true);
  pref("devtools.debugger.pending-selected-location", "{}");
  pref("devtools.debugger.pending-breakpoints", "[]");
  pref("devtools.debugger.expressions", "[]");
  pref("devtools.debugger.file-search-case-sensitive", true);
  pref("devtools.debugger.file-search-whole-word", false);
  pref("devtools.debugger.file-search-regex-match", false);
}

const prefs = new PrefsHelper("devtools", {
  clientSourceMapsEnabled: ["Bool", "debugger.client-source-maps-enabled"],
  pauseOnExceptions: ["Bool", "debugger.pause-on-exceptions"],
  ignoreCaughtExceptions: ["Bool", "debugger.ignore-caught-exceptions"],
  callStackVisible: ["Bool", "debugger.call-stack-visible"],
  scopesVisible: ["Bool", "debugger.scopes-visible"],
  startPanelCollapsed: ["Bool", "debugger.start-panel-collapsed"],
  endPanelCollapsed: ["Bool", "debugger.end-panel-collapsed"],
  frameworkGroupingOn: ["Bool", "debugger.ui.framework-grouping-on"],
  tabs: ["Json", "debugger.tabs"],
  pendingSelectedLocation: ["Json", "debugger.pending-selected-location"],
  pendingBreakpoints: ["Json", "debugger.pending-breakpoints"],
  expressions: ["Json", "debugger.expressions"],
  fileSearchCaseSensitive: ["Bool", "debugger.file-search-case-sensitive"],
  fileSearchWholeWord: ["Bool", "debugger.file-search-whole-word"],
  fileSearchRegexMatch: ["Bool", "debugger.file-search-regex-match"]
});

module.exports = { prefs };
