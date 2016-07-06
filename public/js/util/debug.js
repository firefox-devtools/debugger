const { isEnabled } = require("../../../config/feature");

 function debugGlobal(field, value) {
  if (!isEnabled("development")) {
    return;
  }

  window[field] = value;
}

module.exports = {
  debugGlobal
}
