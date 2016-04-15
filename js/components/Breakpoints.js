/* globals URL gThreadClient */
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

const Breakpoints = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    sources: ImPropTypes.map.isRequired
  },

  displayName: "Breakpoints",

  onResumeClick() {
    gThreadClient.resume();
  },

  onStepOverClick() {
    gThreadClient.stepOver();
  },

  onStepInClick() {
    gThreadClient.stepIn();
  },

  onStepOutClick() {
    gThreadClient.stepOut();
  },

  render() {
    return dom.div(
      { className: "breakpoints" },
      dom.div(null,
        dom.button({ onClick: this.onResumeClick }, "Resume"),
        dom.button({ onClick: this.onStepOverClick }, "Over"),
        dom.button({ onClick: this.onStepInClick }, "In"),
        dom.button({ onClick: this.onStepOutClick }, "Out")
      ),
      dom.ul(
        null,
        this.props.breakpoints.valueSeq().map(bp => {
          return renderBreakpoint(this.props.sources, bp);
        })
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
