function reportException(who, exception) {
  let msg = who + " threw an exception: ";
  console.error(msg, exception);
}

function executeSoon(aFn) {
  setTimeout(aFn, 0);
};

module.exports = {
  reportException,
  executeSoon
}
