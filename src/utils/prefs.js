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
  pref("devtools.debugger.pending-selected-location", "{}");
  pref("devtools.debugger.pending-breakpoints", "[]");
  pref("devtools.debugger.expressions", "[]");
}

type PrefsType = {
  clientSourceMapsEnabled: boolean,
  pauseOnExceptions: boolean,
  ignoreCaughtExceptions: boolean,
  callStackVisible: boolean,
  scopesVisible: boolean,
  startPanelCollapsed: boolean,
  endPanelCollapsed: boolean,
  tabs: Object,
  pendingSelectedLocation: Object,
  pendingBreakpoints: any[],
  expressions: Object
};

const prefs: PrefsType = new PrefsHelper("devtools", {
  clientSourceMapsEnabled: ["Bool", "debugger.client-source-maps-enabled"],
  pauseOnExceptions: ["Bool", "debugger.pause-on-exceptions"],
  ignoreCaughtExceptions: ["Bool", "debugger.ignore-caught-exceptions"],
  callStackVisible: ["Bool", "debugger.call-stack-visible"],
  scopesVisible: ["Bool", "debugger.scopes-visible"],
  startPanelCollapsed: ["Bool", "debugger.start-panel-collapsed"],
  endPanelCollapsed: ["Bool", "debugger.end-panel-collapsed"],
  tabs: ["Json", "debugger.tabs"],
  pendingSelectedLocation: ["Json", "debugger.pending-selected-location"],
  pendingBreakpoints: ["Json", "debugger.pending-breakpoints"],
  expressions: ["Json", "debugger.expressions"]
});

module.exports = { prefs };
