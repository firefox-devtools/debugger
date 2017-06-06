// @flow
import { DOM as dom, PropTypes, PureComponent } from "react";
import { connect } from "react-redux";
import { createSelector } from "reselect";
import { bindActionCreators } from "redux";
import ImPropTypes from "react-immutable-proptypes";
import classnames from "classnames";
import actions from "../../actions";
import {
  getSources,
  getSourceInSources,
  getPause,
  getBreakpoints
} from "../../selectors";
import { makeLocationId } from "../../utils/breakpoint";
import { endTruncateStr } from "../../utils/utils";
import { basename } from "../../utils/path";
import CloseButton from "../shared/Button/Close";
import "./Breakpoints.css";
const get = require("lodash/get");

import type { Breakpoint } from "../../types";

type LocalBreakpoint = Breakpoint & {
  location: any,
  isCurrentlyPaused: boolean,
  locationId: string
};

function isCurrentlyPausedAtBreakpoint(pause, breakpoint) {
  if (!pause || pause.isInterrupted) {
    return false;
  }

  const bpId = makeLocationId(breakpoint.location);
  const pausedId = makeLocationId(get(pause, "frame.location"));
  return bpId === pausedId;
}

function renderSourceLocation(source, line, column) {
  const url = source.get("url") ? basename(source.get("url")) : null;
  const bpLocation = line + (column ? `:${column}` : "");
  // const line = url !== "" ? `: ${line}` : "";
  return url
    ? dom.div(
        { className: "location" },
        `${endTruncateStr(url, 30)}: ${bpLocation}`
      )
    : null;
}

class Breakpoints extends PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    const { breakpoints } = this.props;
    return breakpoints !== nextProps.breakpoints;
  }

  handleCheckbox(breakpoint) {
    if (breakpoint.loading) {
      return;
    }

    if (breakpoint.disabled) {
      this.props.enableBreakpoint(breakpoint.location);
    } else {
      this.props.disableBreakpoint(breakpoint.location);
    }
  }

  selectBreakpoint(breakpoint) {
    const sourceId = breakpoint.location.sourceId;
    const line = breakpoint.location.line;
    this.props.selectSource(sourceId, { line });
  }

  removeBreakpoint(event, breakpoint) {
    event.stopPropagation();
    this.props.removeBreakpoint(breakpoint.location);
  }

  renderBreakpoint(breakpoint) {
    const snippet = breakpoint.text || "";
    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const column = breakpoint.location.column;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;
    const isConditional = !!breakpoint.condition;

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
        onClick: ev => ev.stopPropagation()
      }),
      dom.div(
        { className: "breakpoint-label", title: breakpoint.text },
        dom.div(
          {},
          renderSourceLocation(breakpoint.location.source, line, column)
        )
      ),
      dom.div({ className: "breakpoint-snippet" }, snippet),
      CloseButton({
        handleClick: ev => this.removeBreakpoint(ev, breakpoint),
        tooltip: L10N.getStr("breakpoints.removeBreakpointTooltip")
      })
    );
  }

  render() {
    const { breakpoints } = this.props;
    return dom.div(
      { className: "pane breakpoints-list" },
      breakpoints.size === 0
        ? dom.div({ className: "pane-info" }, L10N.getStr("breakpoints.none"))
        : breakpoints.valueSeq().map(bp => {
            return this.renderBreakpoint(bp);
          })
    );
  }
}

Breakpoints.displayName = "Breakpoints";

Breakpoints.propTypes = {
  breakpoints: ImPropTypes.map.isRequired,
  enableBreakpoint: PropTypes.func.isRequired,
  disableBreakpoint: PropTypes.func.isRequired,
  selectSource: PropTypes.func.isRequired,
  removeBreakpoint: PropTypes.func.isRequired
};

function updateLocation(sources, pause, bp): LocalBreakpoint {
  const source = getSourceInSources(sources, bp.location.sourceId);
  const isCurrentlyPaused = isCurrentlyPausedAtBreakpoint(pause, bp);
  const locationId = makeLocationId(bp.location);

  const location = Object.assign({}, bp.location, { source });
  const localBP = Object.assign({}, bp, {
    location,
    locationId,
    isCurrentlyPaused
  });

  return localBP;
}

const _getBreakpoints = createSelector(
  getBreakpoints,
  getSources,
  getPause,
  (breakpoints, sources, pause) =>
    breakpoints
      .map(bp => updateLocation(sources, pause, bp))
      .filter(
        bp => bp.location.source && !bp.location.source.get("isBlackBoxed")
      )
);

export default connect(
  (state, props) => ({ breakpoints: _getBreakpoints(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
