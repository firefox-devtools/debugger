/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

const { isDevelopment } = require("devtools-config");
const { Services, PrefsHelper } = require("devtools-modules");

const prefsSchemaVersion = "1.0.3";

const pref = Services.pref;

if (isDevelopment()) {
  pref("devtools.debugger.alphabetize-outline", false);
  pref("devtools.debugger.auto-pretty-print", true);
  pref("devtools.source-map.client-service.enabled", true);
  pref("devtools.debugger.pause-on-exceptions", false);
  pref("devtools.debugger.ignore-caught-exceptions", false);
  pref("devtools.debugger.call-stack-visible", true);
  pref("devtools.debugger.scopes-visible", true);
  pref("devtools.debugger.workers-visible", true);
  pref("devtools.debugger.expressions-visible", true);
  pref("devtools.debugger.breakpoints-visible", true);
  pref("devtools.debugger.start-panel-collapsed", false);
  pref("devtools.debugger.end-panel-collapsed", false);
  pref("devtools.debugger.tabs", "[]");
  pref("devtools.debugger.tabsBlackBoxed", "[]");
  pref("devtools.debugger.ui.framework-grouping-on", true);
  pref("devtools.debugger.pending-selected-location", "{}");
  pref("devtools.debugger.pending-breakpoints", "{}");
  pref("devtools.debugger.expressions", "[]");
  pref("devtools.debugger.file-search-case-sensitive", false);
  pref("devtools.debugger.file-search-whole-word", false);
  pref("devtools.debugger.file-search-regex-match", false);
  pref("devtools.debugger.project-directory-root", "");
  pref("devtools.debugger.prefs-schema-version", "1.0.1");
  pref("devtools.debugger.features.workers", true);
  pref("devtools.debugger.features.async-stepping", true);
  pref("devtools.debugger.features.wasm", true);
  pref("devtools.debugger.features.shortcuts", true);
  pref("devtools.debugger.features.root", true);
  pref("devtools.debugger.features.column-breakpoints", false);
  pref("devtools.debugger.features.chrome-scopes", false);
  pref("devtools.debugger.features.map-scopes", true);
  pref("devtools.debugger.features.breakpoints-dropdown", true);
  pref("devtools.debugger.features.remove-command-bar-options", true);
  pref("devtools.debugger.features.code-coverage", false);
  pref("devtools.debugger.features.event-listeners", false);
  pref("devtools.debugger.features.code-folding", false);
  pref("devtools.debugger.features.outline", true);
  pref("devtools.debugger.features.column-breakpoints", true);
  pref("devtools.debugger.features.replay", true);
}

export const prefs = new PrefsHelper("devtools", {
  alphabetizeOutline: ["Bool", "debugger.alphabetize-outline"],
  autoPrettyPrint: ["Bool", "debugger.auto-pretty-print"],
  clientSourceMapsEnabled: ["Bool", "source-map.client-service.enabled"],
  pauseOnExceptions: ["Bool", "debugger.pause-on-exceptions"],
  ignoreCaughtExceptions: ["Bool", "debugger.ignore-caught-exceptions"],
  callStackVisible: ["Bool", "debugger.call-stack-visible"],
  scopesVisible: ["Bool", "debugger.scopes-visible"],
  workersVisible: ["Bool", "debugger.workers-visible"],
  breakpointsVisible: ["Bool", "debugger.breakpoints-visible"],
  expressionsVisible: ["Bool", "debugger.expressions-visible"],
  startPanelCollapsed: ["Bool", "debugger.start-panel-collapsed"],
  endPanelCollapsed: ["Bool", "debugger.end-panel-collapsed"],
  frameworkGroupingOn: ["Bool", "debugger.ui.framework-grouping-on"],
  tabs: ["Json", "debugger.tabs", []],
  tabsBlackBoxed: ["Json", "debugger.tabsBlackBoxed", []],
  pendingSelectedLocation: ["Json", "debugger.pending-selected-location", {}],
  pendingBreakpoints: ["Json", "debugger.pending-breakpoints", {}],
  expressions: ["Json", "debugger.expressions", []],
  fileSearchCaseSensitive: ["Bool", "debugger.file-search-case-sensitive"],
  fileSearchWholeWord: ["Bool", "debugger.file-search-whole-word"],
  fileSearchRegexMatch: ["Bool", "debugger.file-search-regex-match"],
  debuggerPrefsSchemaVersion: ["Char", "debugger.prefs-schema-version"],
  projectDirectoryRoot: ["Char", "debugger.project-directory-root", ""]
});

export const features = new PrefsHelper("devtools.debugger.features", {
  asyncStepping: ["Bool", "async-stepping"],
  wasm: ["Bool", "wasm"],
  shortcuts: ["Bool", "shortcuts"],
  root: ["Bool", "root"],
  columnBreakpoints: ["Bool", "column-breakpoints"],
  chromeScopes: ["Bool", "chrome-scopes"],
  mapScopes: ["Bool", "map-scopes"],
  breakpointsDropdown: ["Bool", "breakpoints-dropdown"],
  removeCommandBarOptions: ["Bool", "remove-command-bar-options"],
  workers: ["Bool", "workers"],
  codeCoverage: ["Bool", "code-coverage"],
  eventListeners: ["Bool", "event-listeners"],
  outline: ["Bool", "outline"],
  codeFolding: ["Bool", "code-folding"],
  replay: ["Bool", "replay"]
});

if (prefs.debuggerPrefsSchemaVersion !== prefsSchemaVersion) {
  // clear pending Breakpoints
  prefs.pendingBreakpoints = {};
  prefs.debuggerPrefsSchemaVersion = prefsSchemaVersion;
}
