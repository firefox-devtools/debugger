const { isDevelopment } = require("devtools-config");

function debugGlobal(field, value) {
  if (isDevelopment()) {
    window[field] = value;
  }
}

function injectGlobals({ store }) {
  debugGlobal("store", store);
  debugGlobal("injectDebuggee", require("../test/utils/debuggee"));
  debugGlobal("serializeStore", () => {
    return JSON.parse(JSON.stringify(store.getState()));
  });
}

module.exports = {
  debugGlobal,
  injectGlobals
};
