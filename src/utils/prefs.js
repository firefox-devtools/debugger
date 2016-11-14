var { PrefsHelper } = require("devtools-sham-modules");
const { Services: { pref }} = require("devtools-modules");
const { isDevelopment } = require("devtools-config");

if (isDevelopment()) {
  pref("devtools.debugger.client-source-maps-enabled", true);
}

const prefs = new PrefsHelper("devtools", {
  clientSourceMapsEnabled: ["Bool", "debugger.client-source-maps-enabled"],
});

module.exports = { prefs };
