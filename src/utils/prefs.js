var { PrefsHelper } = require("devtools-sham-modules");
const { Services: { pref }} = require("devtools-modules");
const { isDevelopment } = require("devtools-config");

if (isDevelopment()) {
  pref("devtools.debugger.client-source-maps-enabled", true);
  pref("devtools.debugger.pause-on-exceptions", false);
  pref("devtools.debugger.ignore-caught-exceptions", false);
  pref("devtools.debugger.call-stack-visible", false);
  pref("devtools.debugger.scopes-visible", false);
}

const prefs = new PrefsHelper("devtools", {
  clientSourceMapsEnabled: ["Bool", "debugger.client-source-maps-enabled"],
  pauseOnExceptions: ["Bool", "debugger.pause-on-exceptions"],
  ignoreCaughtExceptions: ["Bool", "debugger.ignore-caught-exceptions"],
  callStackVisible: ["Bool", "debugger.call-stack-visible"],
  scopesVisible: ["Bool", "debugger.scopes-visible"]
});

module.exports = { prefs };
