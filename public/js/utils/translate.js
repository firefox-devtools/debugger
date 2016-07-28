const React = require("react");
const { DOM: dom } = React;

function translate() {
  return dom.span({ className: "translate-string" }, ...arguments);
}

module.exports = {
  translate
};
