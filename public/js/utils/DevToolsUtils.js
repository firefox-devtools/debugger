const assert = require("./assert");

function reportException(who, exception) {
  let msg = who + " threw an exception: ";
  console.error(msg, exception);
}

function executeSoon(fn) {
  setTimeout(fn, 0);
}

module.exports = {
  reportException,
  executeSoon,
  assert
};
