const React = require("react");
const dom = React.DOM;

function Breakpoints({ breakpoints }) {
  return dom.ul(
    null,
    breakpoints.map(bp => dom.li(
      null,
      bp.location.actor + ": " + bp.location.line
    ))
  );
}

module.exports = Breakpoints;
