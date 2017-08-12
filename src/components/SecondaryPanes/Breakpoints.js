// @flow
import { DOM as dom, PropTypes, PureComponent } from "react";
import { connect } from "react-redux";
import { createSelector } from "reselect";
import { bindActionCreators } from "redux";
import { isEnabled } from "devtools-config";
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
import { getFilename } from "../../utils/source";
import { showMenu, buildMenu } from "devtools-launchpad";
import CloseButton from "../shared/Button/Close";
import "./Breakpoints.css";
import get from "lodash/get";

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
  const filename = source ? getFilename(source.toJS()) : null;
  const isWasm = source && source.get("isWasm");
  const columnVal =
    isEnabled("columnBreakpoints") && column ? `:${column}` : "";
  const bpLocation = isWasm
    ? `0x${line.toString(16).toUpperCase()}`
    : `${line}${columnVal}`;

  return filename
    ? dom.div(
        { className: "location" },
        `${endTruncateStr(filename, 30)}: ${bpLocation}`
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

  showContextMenu(e, breakpoint) {
    const {
      removeBreakpoint,
      removeBreakpoints,
      removeAllBreakpoints,
      toggleBreakpoints,
      toggleAllBreakpoints,
      toggleDisabledBreakpoint,
      breakpoints
    } = this.props;

    e.preventDefault();

    const deleteSelfLabel = L10N.getStr("breakpointMenuItem.deleteSelf");
    const deleteAllLabel = L10N.getStr("breakpointMenuItem.deleteAll");
    const deleteOthersLabel = L10N.getStr("breakpointMenuItem.deleteOthers");
    const enableSelfLabel = L10N.getStr("breakpointMenuItem.enableSelf");
    const enableAllLabel = L10N.getStr("breakpointMenuItem.enableAll");
    const enableOthersLabel = L10N.getStr("breakpointMenuItem.enableOthers");
    const disableSelfLabel = L10N.getStr("breakpointMenuItem.disableSelf");
    const disableAllLabel = L10N.getStr("breakpointMenuItem.disableAll");
    const disableOthersLabel = L10N.getStr("breakpointMenuItem.disableOthers");

    const deleteSelfKey = L10N.getStr(
      "breakpointMenuItem.deleteSelf.accesskey"
    );
    const deleteAllKey = L10N.getStr("breakpointMenuItem.deleteAll.accesskey");
    const deleteOthersKey = L10N.getStr(
      "breakpointMenuItem.deleteOthers.accesskey"
    );
    const enableSelfKey = L10N.getStr(
      "breakpointMenuItem.enableSelf.accesskey"
    );
    const enableAllKey = L10N.getStr("breakpointMenuItem.enableAll.accesskey");
    const enableOthersKey = L10N.getStr(
      "breakpointMenuItem.enableOthers.accesskey"
    );
    const disableSelfKey = L10N.getStr(
      "breakpointMenuItem.disableSelf.accesskey"
    );
    const disableAllKey = L10N.getStr(
      "breakpointMenuItem.disableAll.accesskey"
    );
    const disableOthersKey = L10N.getStr(
      "breakpointMenuItem.disableOthers.accesskey"
    );

    const otherBreakpoints = breakpoints.filter(b => b !== breakpoint);
    const enabledBreakpoints = breakpoints.filter(b => !b.disabled);
    const disabledBreakpoints = breakpoints.filter(b => b.disabled);
    const otherEnabledBreakpoints = breakpoints.filter(
      b => !b.disabled && b !== breakpoint
    );
    const otherDisabledBreakpoints = breakpoints.filter(
      b => b.disabled && b !== breakpoint
    );

    const deleteSelf = {
      id: "node-menu-delete-self",
      label: deleteSelfLabel,
      accesskey: deleteSelfKey,
      disabled: false,
      click: () => removeBreakpoint(breakpoint.location)
    };

    const deleteAll = {
      id: "node-menu-delete-all",
      label: deleteAllLabel,
      accesskey: deleteAllKey,
      disabled: false,
      click: () => removeAllBreakpoints()
    };

    const deleteOthers = {
      id: "node-menu-delete-other",
      label: deleteOthersLabel,
      accesskey: deleteOthersKey,
      disabled: false,
      click: () => removeBreakpoints(otherBreakpoints)
    };

    const enableSelf = {
      id: "node-menu-enable-self",
      label: enableSelfLabel,
      accesskey: enableSelfKey,
      disabled: false,
      click: () => toggleDisabledBreakpoint(breakpoint.location.line)
    };

    const enableAll = {
      id: "node-menu-enable-all",
      label: enableAllLabel,
      accesskey: enableAllKey,
      disabled: false,
      click: () => toggleAllBreakpoints(false)
    };

    const enableOthers = {
      id: "node-menu-enable-others",
      label: enableOthersLabel,
      accesskey: enableOthersKey,
      disabled: false,
      click: () => toggleBreakpoints(false, otherDisabledBreakpoints)
    };

    const disableSelf = {
      id: "node-menu-disable-self",
      label: disableSelfLabel,
      accesskey: disableSelfKey,
      disabled: false,
      click: () => toggleDisabledBreakpoint(breakpoint.location.line)
    };

    const disableAll = {
      id: "node-menu-disable-all",
      label: disableAllLabel,
      accesskey: disableAllKey,
      disabled: false,
      click: () => toggleAllBreakpoints(true)
    };

    const disableOthers = {
      id: "node-menu-disable-others",
      label: disableOthersLabel,
      accesskey: disableOthersKey,
      click: () => toggleBreakpoints(true, otherEnabledBreakpoints)
    };

    const items = [
      { item: enableSelf, hidden: () => !breakpoint.disabled },
      { item: disableSelf, hidden: () => breakpoint.disabled },
      { item: deleteSelf },
      { item: deleteAll },
      { item: deleteOthers, hidden: () => breakpoints.size === 1 },
      {
        item: enableAll,
        hidden: () => disabledBreakpoints.size === 0
      },
      {
        item: disableAll,
        hidden: () => enabledBreakpoints.size === 0
      },
      {
        item: enableOthers,
        hidden: () => otherDisabledBreakpoints.size === 0
      },
      {
        item: disableOthers,
        hidden: () => otherEnabledBreakpoints.size === 0
      }
    ];

    showMenu(e, buildMenu(items));
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
        onClick: () => this.selectBreakpoint(breakpoint),
        onContextMenu: e => this.showContextMenu(e, breakpoint)
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
  removeBreakpoint: PropTypes.func.isRequired,
  removeAllBreakpoints: PropTypes.func.isRequired
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
