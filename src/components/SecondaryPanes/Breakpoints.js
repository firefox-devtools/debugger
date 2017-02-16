// @flow
import { DOM as dom, PropTypes, createClass } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ImPropTypes from "react-immutable-proptypes";
import classnames from "classnames";
import actions from "../../actions";
import { getSource, getPause, getBreakpoints } from "../../selectors";
import { makeLocationId } from "../../reducers/breakpoints";
import { endTruncateStr } from "../../utils/utils";
import { basename } from "../../utils/path";
import CloseButton from "../shared/Button/Close";
import "./Breakpoints.css";
import type { Breakpoint } from "../../types";

function isCurrentlyPausedAtBreakpoint(state, breakpoint) {
  const pause = getPause(state);
  if (!pause || pause.get("isInterrupted")) {
    return false;
  }

  const bpId = makeLocationId(breakpoint.location);
  const pausedId = makeLocationId(
    pause.getIn(["frame", "location"]).toJS()
  );

  return bpId === pausedId;
}

function renderSourceLocation(source, line) {
  const url = source.get("url") ? basename(source.get("url")) : null;
  // const line = url !== "" ? `: ${line}` : "";
  return url ?
    dom.div(
      { className: "location" },
      `${endTruncateStr(url, 30)}: ${line}`
    ) : null;
}

const Breakpoints = createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    enableBreakpoint: PropTypes.func.isRequired,
    disableBreakpoint: PropTypes.func.isRequired,
    selectSource: PropTypes.func.isRequired,
    removeBreakpoint: PropTypes.func.isRequired
  },

  displayName: "Breakpoints",

  shouldComponentUpdate(nextProps, nextState) {
    const { breakpoints } = this.props;
    return breakpoints !== nextProps.breakpoints;
  },

  handleCheckbox(breakpoint) {
    if (breakpoint.loading) {
      return;
    }

    if (breakpoint.disabled) {
      this.props.enableBreakpoint(breakpoint.location);
    } else {
      this.props.disableBreakpoint(breakpoint.location);
    }
  },

  selectBreakpoint(breakpoint) {
    const sourceId = breakpoint.location.sourceId;
    const line = breakpoint.location.line;
    this.props.selectSource(sourceId, { line });
  },

  removeBreakpoint(event, breakpoint) {
    event.stopPropagation();
    this.props.removeBreakpoint(breakpoint.location);
  },

  renderBreakpoint(breakpoint) {
    const snippet = breakpoint.text || "";
    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;
    const isConditional = breakpoint.condition !== null;

    return dom.div(
      {
        className: classnames({
          breakpoint,
          paused: isCurrentlyPaused,
          disabled: isDisabled,
          "is-conditional": isConditional
        }),
        key: locationId,
        onClick: () => this.selectBreakpoint(breakpoint)
      },
      dom.input({
        type: "checkbox",
        className: "breakpoint-checkbox",
        checked: !isDisabled,
        onChange: () => this.handleCheckbox(breakpoint),
        // Prevent clicking on the checkbox from triggering the onClick of
        // the surrounding div
        onClick: (ev) => ev.stopPropagation()
      }),
      dom.div(
        { className: "breakpoint-label", title: breakpoint.text },
        dom.div({}, renderSourceLocation(breakpoint.location.source, line))
      ),
      dom.div({ className: "breakpoint-snippet" }, snippet),
      CloseButton({
        handleClick: (ev) => this.removeBreakpoint(ev, breakpoint),
        tooltip: L10N.getStr("breakpoints.removeBreakpointTooltip")
      }));
  },

  render() {
    const { breakpoints } = this.props;
    return dom.div(
      { className: "pane breakpoints-list" },
      (breakpoints.size === 0 ?
       dom.div({ className: "pane-info" }, L10N.getStr("breakpoints.none")) :
       breakpoints.valueSeq().map(bp => {
         return this.renderBreakpoint(bp);
       }))
    );
  }
});

function _getBreakpoints(state) {
  return getBreakpoints(state).map(bp => {
    const source = getSource(state, bp.location.sourceId);
    const isCurrentlyPaused = isCurrentlyPausedAtBreakpoint(state, bp);
    const locationId = makeLocationId(bp.location);

    bp = Object.assign({}, bp);
    bp.location.source = source;
    bp.locationId = locationId;
    bp.isCurrentlyPaused = isCurrentlyPaused;
    return bp;
  })
  .filter(bp => bp.location.source);
}

export default connect(
  (state, props) => ({
    breakpoints: _getBreakpoints(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
