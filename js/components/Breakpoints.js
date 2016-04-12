/* globals URL gThreadClient */
"use strict";

const React = require("react");
const { connect } = require("react-redux");
const { getSources } = require("../queries");
const ImPropTypes = require("react-immutable-proptypes");
const dom = React.DOM;

require("./Breakpoints.css");

const Breakpoints = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.list.isRequired,
    sources: ImPropTypes.map.isRequired
  },

  displayName: "Breakpoints",

  render() {
    function onResumeClick() {
      console.log("click");
      gThreadClient.resume();
    }

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

    return dom.div(
      { className: "breakpoints" },
      dom.button({ onClick: onResumeClick }, "resume"),
      dom.ul(
        null,
        this.props.breakpoints.map(bp => dom.li(
          null,
          getFilenameFromSources(this.props.sources,
                                 bp.getIn(["location", "actor"]))
            + ", line " + bp.getIn(["location", "line"]))
        )
      )
    );
  }
});

module.exports = connect(
  (state, props) => ({ sources: getSources(state)})
)(Breakpoints);
