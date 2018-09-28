/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { PrefsHelper } from "devtools-modules";
import { isDevelopment } from "devtools-environment";
import Services from "devtools-services";
import { asyncStoreHelper } from "./asyncStoreHelper";

const prefsSchemaVersion = "1.0.5";

const pref = Services.pref;

if (isDevelopment()) {
  pref("devtools.debugger.alphabetize-outline", false);
  pref("devtools.debugger.auto-pretty-print", false);
  pref("devtools.source-map.client-service.enabled", true);
  pref("devtools.debugger.pause-on-exceptions", false);
  pref("devtools.debugger.pause-on-caught-exceptions", false);
  pref("devtools.debugger.ignore-caught-exceptions", true);
  pref("devtools.debugger.call-stack-visible", true);
  pref("devtools.debugger.scopes-visible", true);
  pref("devtools.debugger.component-visible", true);
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
  pref("devtools.debugger.skip-pausing", false);
  pref("devtools.debugger.features.workers", true);
  pref("devtools.debugger.features.async-stepping", true);
  pref("devtools.debugger.features.wasm", true);
  pref("devtools.debugger.features.shortcuts", true);
  pref("devtools.debugger.features.root", true);
  pref("devtools.debugger.features.column-breakpoints", false);
  pref("devtools.debugger.features.map-scopes", true);
  pref("devtools.debugger.features.remove-command-bar-options", true);
  pref("devtools.debugger.features.code-coverage", false);
  pref("devtools.debugger.features.event-listeners", false);
  pref("devtools.debugger.features.code-folding", false);
  pref("devtools.debugger.features.outline", true);
  pref("devtools.debugger.features.column-breakpoints", true);
  pref("devtools.debugger.features.pause-points", true);
  pref("devtools.debugger.features.skip-pausing", true);
  pref("devtools.debugger.features.component-pane", false);
  pref("devtools.debugger.features.autocomplete-expressions", false);
  pref("devtools.debugger.features.map-expression-bindings", true);
  pref("devtools.debugger.features.map-await-expression", true);
}

export const prefs = new PrefsHelper("devtools", {
  alphabetizeOutline: ["Bool", "debugger.alphabetize-outline"],
  autoPrettyPrint: ["Bool", "debugger.auto-pretty-print"],
  clientSourceMapsEnabled: ["Bool", "source-map.client-service.enabled"],
  pauseOnExceptions: ["Bool", "debugger.pause-on-exceptions"],
  pauseOnCaughtExceptions: ["Bool", "debugger.pause-on-caught-exceptions"],
  ignoreCaughtExceptions: ["Bool", "debugger.ignore-caught-exceptions"],
  callStackVisible: ["Bool", "debugger.call-stack-visible"],
  scopesVisible: ["Bool", "debugger.scopes-visible"],
  componentVisible: ["Bool", "debugger.component-visible"],
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
  projectDirectoryRoot: ["Char", "debugger.project-directory-root", ""],
  skipPausing: ["Bool", "debugger.skip-pausing"]
});

export const features = new PrefsHelper("devtools.debugger.features", {
  asyncStepping: ["Bool", "async-stepping"],
  wasm: ["Bool", "wasm"],
  shortcuts: ["Bool", "shortcuts"],
  root: ["Bool", "root"],
  columnBreakpoints: ["Bool", "column-breakpoints"],
  mapScopes: ["Bool", "map-scopes"],
  removeCommandBarOptions: ["Bool", "remove-command-bar-options"],
  workers: ["Bool", "workers"],
  codeCoverage: ["Bool", "code-coverage"],
  eventListeners: ["Bool", "event-listeners"],
  outline: ["Bool", "outline"],
  codeFolding: ["Bool", "code-folding"],
  pausePoints: ["Bool", "pause-points"],
  skipPausing: ["Bool", "skip-pausing"],
  autocompleteExpression: ["Bool", "autocomplete-expressions"],
  mapExpressionBindings: ["Bool", "map-expression-bindings"],
  mapAwaitExpression: ["Bool", "map-await-expression"],
  componentPane: ["Bool", "component-pane"]
});

export const asyncStore = asyncStoreHelper("debugger", {
  pendingBreakpoints: ["pending-breakpoints", {}],
  tabs: ["tabs", []]
});

if (prefs.debuggerPrefsSchemaVersion !== prefsSchemaVersion) {
  // clear pending Breakpoints
  prefs.pendingBreakpoints = {};
  prefs.tabs = [];
  prefs.debuggerPrefsSchemaVersion = prefsSchemaVersion;
}
