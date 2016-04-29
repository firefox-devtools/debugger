const React = require("react");
const { DOM: dom } = React;
const { div } = dom;

require("./Frames.css");

function getFrameTitle(frame) {
  if (frame.type == "call") {
    let c = frame.callee;
    return (c.name || c.userDisplayName || c.displayName || "(anonymous)");
  }
  return "(" + frame.type + ")";
}

function Frames({ frames }) {
  return div(
    { className: "pane-info frames" },
    !frames ?
      div({ className: "empty" }, "Not Paused") :
      dom.ul(null, frames.map(frame => {
        return dom.li(null, getFrameTitle(frame));
      }))
  );
}

module.exports = Frames;
