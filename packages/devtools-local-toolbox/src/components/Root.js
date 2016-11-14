const React = require("react");
const { DOM: dom } = React;
const classnames = require("classnames");
const { getValue, isDevelopment } = require("devtools-config");

require("./Root.css");

function themeClass() {
  const theme = getValue("theme");
  return `theme-${theme}`;
}

module.exports = function(component) {
  return dom.div(
    {
      className: classnames("theme-body", { [themeClass()]: isDevelopment() }),
      style: { flex: 1 }
    },
    React.createElement(component)
  );
};
