"use strict";

const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { getSources, getBreakpoints } = require("../selectors");
const ImPropTypes = require("react-immutable-proptypes");
const { DOM: dom, PropTypes } = React;

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

const Breakpoints = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    sources: ImPropTypes.map.isRequired,
    enableBreakpoint: PropTypes.func.isRequired,
    disableBreakpoint: PropTypes.func.isRequired,
  },

  displayName: "Breakpoints",

  handleCheckbox(breakpoint) {
    const loc = breakpoint.get("location").toJS();

    if (breakpoint.get("disabled")) {
      this.props.enableBreakpoint(loc);
    } else {
      this.props.disableBreakpoint(loc);
    }
  },

  renderBreakpoint(breakpoint) {
    const sourceActor = breakpoint.getIn(["location", "actor"]);
    const filename = getFilenameFromSources(
      this.props.sources,
      sourceActor
    );
    const line = breakpoint.getIn(["location", "line"]);

    return dom.div(
      { className: "breakpoint",
        key: `${sourceActor}/${line}` },
      dom.input({ type: "checkbox",
                  checked: !breakpoint.get("disabled"),
                  onChange: () => this.handleCheckbox(breakpoint) }),
      `${filename}, line ${line}`
    );
  },

  render() {
    const { breakpoints } = this.props;

    return dom.div(
      { className: "breakpoints" },
      (breakpoints.size === 0 ?
       dom.div({ className: "pane-info" }, "No Breakpoints") :
       breakpoints.valueSeq().map(bp => {
         return this.renderBreakpoint(bp);
       }))
    );
  }
});

module.exports = connect(
  (state, props) => ({
    sources: getSources(state),
    breakpoints: getBreakpoints(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
