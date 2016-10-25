const React = require("react");
const { DOM: dom } = React;

require("./Root.css");

// Using this static variable allows webpack to know at compile-time
// to avoid this require and not include it at all in the output.
if (process.env.TARGET !== "firefox-panel") {
  require("../lib/themes/light-theme.css");
}

module.exports = function(component) {
  return dom.div(
    {
      style: { flex: 1 }
    },
    React.createElement(component)
  );
};
