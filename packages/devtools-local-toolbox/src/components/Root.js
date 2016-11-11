const classnames = require("classnames");
const { getValue, isDevelopment } = require("devtools-config");

function themeClass() {
  const theme = getValue("theme");
  return `theme-${theme}`;
}

const rootClass = classnames("theme-body", { [themeClass()]: isDevelopment() });

module.exports = function() {
  const root = document.createElement("div");
  root.className = rootClass;
  root.style.setProperty("flex", 1);
  return root;
};
