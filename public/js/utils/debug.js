const { isDevelopment } = require("../feature");

function debugGlobal(field, value) {
  if (!isDevelopment()) {
    return;
  }

  window[field] = value;
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
