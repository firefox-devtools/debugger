const { DOM: dom } = require("react");
require("./Arrow.css");

// This is inline because it's much faster. We need to revisit how we
// load SVGs, at least for components that render them several times.
let Arrow = props => {
  const className = "arrow " + (props.className || "");
  return dom.span(
    Object.assign({}, props, { className }),
    dom.svg(
      { viewBox: "0 0 16 16" },
      dom.path({ d: "M8 13.4c-.5 0-.9-.2-1.2-.6L.4 5.2C0 4.7-.1 4.3.2 3.7S1 3 1.6 3h12.8c.6 0 1.2.1 1.4.7.3.6.2 1.1-.2 1.6l-6.4 7.6c-.3.4-.7.5-1.2.5z" }) // eslint-disable-line max-len
    )
  );
};

module.exports = Arrow;
