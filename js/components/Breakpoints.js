/* globals URL gThreadClient */
"use strict";

const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");
const { getSources } = require("../queries");

require("./Breakpoints.css");

function getFilenameFromSources(sources, actor) {
  const source = sources[actor];
  const url = new URL(source.url);
  const filename = url.pathname.substring(
    url.pathname.lastIndexOf("/") + 1);
  return filename;
}

function Breakpoint(sources, breakpoint) {
  const sourceActor = breakpoint.location.actor;

  const filename = getFilenameFromSources(
    sources,
    sourceActor
  );

  const line = breakpoint.location.line;

  return dom.li(
    { key: `${sourceActor}/${line}` },
    `${filename}, line ${line}`
  );
}

const Breakpoints = React.createClass({
  propTypes: {
    breakpoints: PropTypes.array,
    sources: PropTypes.object
  },

  displayName: "Breakpoints",

  render() {
    function onResumeClick() {
      console.log("click");
      gThreadClient.resume();
    }

    return dom.div(
      { className: "breakpoints" },
      dom.button({ onClick: onResumeClick }, "resume"),
      dom.ul(
        null,
        this.props.breakpoints.map(bp => Breakpoint(this.props.sources, bp))
      )
    );
  }
});

module.exports = connect(
  (state, props) => ({ sources: getSources(state)})
)(Breakpoints);
