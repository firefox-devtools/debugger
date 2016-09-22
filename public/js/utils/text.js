const { Services } = require("Services");

function cmdString() {
  return (Services.appinfo.OS === "Darwin") ? "⌘" : "Ctrl";
}

module.exports = {
  cmdString
};
