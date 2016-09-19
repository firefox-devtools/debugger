const { KeyShortcuts } =
  require("../lib/devtools-sham/client/shared/key-shortcuts");

let shortcuts = null;

function setupShortcuts(window) {
  shortcuts = new KeyShortcuts({ window });
  return shortcuts;
}

function getShortcuts() {
  return shortcuts;
}

module.exports = {
  getShortcuts,
  setupShortcuts
};
