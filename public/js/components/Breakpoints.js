"use strict";

const React = require("react");
const { connect } = require("react-redux");
const { getSources, getBreakpoints } = require("../queries");
const ImPropTypes = require("react-immutable-proptypes");
const dom = React.DOM;

require("./Breakpoints.css");

function getFilenameFromSources(sources, actor) {
  const source = sources.get(actor);
  if (source.get("url")) {
    const url = new URL(source.get("url"));
    const filename = url.pathname.substring(
      url.pathname.lastIndexOf("/") + 1);
    return filename;
  }
  return "";
}

function renderBreakpoint(sources, breakpoint) {
  const sourceActor = breakpoint.getIn(["location", "actor"]);

  const filename = getFilenameFromSources(
    sources,
    sourceActor
  );

  const line = breakpoint.getIn(["location", "line"]);

  return dom.li(
    { key: `${sourceActor}/${line}` },
    `${filename}, line ${line}`
  );
}

function renderBreakpointList(breakpoints, sources) {
  return dom.ul(
    null,
    breakpoints.valueSeq().map(bp => {
      return renderBreakpoint(sources, bp);
    })
  );
}

const Breakpoints = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    sources: ImPropTypes.map.isRequired
  },

  displayName: "Breakpoints",

  render() {
    return dom.div(
      { className: "breakpoints" },
      (this.props.breakpoints.size
        ? renderBreakpointList(this.props.breakpoints, this.props.sources)
        : dom.div({className: "pane-info"}, "No Breakpoints")
      )
    );
  }
});

module.exports = connect(
  (state, props) => ({
    sources: getSources(state),
    breakpoints: getBreakpoints(state)
  })
)(Breakpoints);
