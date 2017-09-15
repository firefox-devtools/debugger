// @flow
import React, { PureComponent } from "react";
import * as I from "immutable";

import { connect } from "react-redux";
import { createSelector } from "reselect";
import { bindActionCreators } from "redux";
import { isEnabled } from "devtools-config";
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
import { get } from "lodash";

import type { Breakpoint, Location } from "../../types";

type LocalBreakpoint = Breakpoint & {
  location: any,
  isCurrentlyPaused: boolean,
  locationId: string
};

type BreakpointsMap = I.Map<string, LocalBreakpoint>;

type Props = {
  breakpoints: BreakpointsMap,
  enableBreakpoint: Location => void,
  disableBreakpoint: Location => void,
  selectSource: (string, { line: number }) => void,
  removeBreakpoint: string => void,
  removeAllBreakpoints: () => void,
  removeBreakpoints: BreakpointsMap => void,
  toggleBreakpoints: (boolean, BreakpointsMap) => void,
  toggleAllBreakpoints: boolean => void,
  toggleDisabledBreakpoint: number => void,
  setBreakpointCondition: Location => void,
  toggleConditionalBreakpointPanel: number => void
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

  if (!filename) {
    return null;
  }

  return (
    <div className="location">
      {`${endTruncateStr(filename, 30)}: ${bpLocation}`}
    </div>
  );
}
renderSourceLocation.displayName = "SourceLocation";

class Breakpoints extends PureComponent {
  props: Props;

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
      setBreakpointCondition,
      toggleConditionalBreakpointPanel,
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
    const removeConditionLabel = L10N.getStr(
      "breakpointMenuItem.removeCondition.label"
    );
    const editConditionLabel = L10N.getStr(
      "breakpointMenuItem.editCondition.label"
    );

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
    const removeConditionKey = L10N.getStr(
      "breakpointMenuItem.removeCondition.accesskey"
    );
    const editConditionKey = L10N.getStr(
      "breakpointMenuItem.editCondition.accesskey"
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

    const removeCondition = {
      id: "node-menu-remove-condition",
      label: removeConditionLabel,
      accesskey: removeConditionKey,
      disabled: false,
      click: () => setBreakpointCondition(breakpoint.location)
    };

    const editCondition = {
      id: "node-menu-edit-condition",
      label: editConditionLabel,
      accesskey: editConditionKey,
      click: () => toggleConditionalBreakpointPanel(breakpoint.location.line)
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
      },
      {
        item: removeCondition,
        hidden: () => !breakpoint.condition
      },
      {
        item: editCondition,
        hidden: () => !breakpoint.condition
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

  toggleConditionalBreakpointPanel(line) {
    this.props.toggleConditionalBreakpointPanel(line);
  }

  renderBreakpoint(breakpoint) {
    const snippet = breakpoint.text || "";
    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const column = breakpoint.location.column;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;
    const isConditional = !!breakpoint.condition;
    const isHidden = breakpoint.hidden;

    if (isHidden) {
      return;
    }

    return (
      <div
        className={classnames({
          breakpoint,
          paused: isCurrentlyPaused,
          disabled: isDisabled,
          "is-conditional": isConditional
        })}
        key={locationId}
        onClick={() => this.selectBreakpoint(breakpoint)}
        onContextMenu={e => this.showContextMenu(e, breakpoint)}
      >
        <input
          type="checkbox"
          className="breakpoint-checkbox"
          checked={!isDisabled}
          onChange={() => this.handleCheckbox(breakpoint)}
          onClick={ev => ev.stopPropagation()}
        />
        <div className="breakpoint-label" title={breakpoint.text}>
          <div>
            {renderSourceLocation(breakpoint.location.source, line, column)}
          </div>
        </div>
        <div className="breakpoint-snippet">{snippet}</div>
        <CloseButton
          handleClick={ev => this.removeBreakpoint(ev, breakpoint)}
          tooltip={L10N.getStr("breakpoints.removeBreakpointTooltip")}
        />
      </div>
    );
  }

  render() {
    const { breakpoints } = this.props;
    const children =
      breakpoints.size === 0 ? (
        <div className="pane-info">{L10N.getStr("breakpoints.none")}</div>
      ) : (
        breakpoints.valueSeq().map(bp => this.renderBreakpoint(bp))
      );

    return <div className="pane breakpoints-list">{children}</div>;
  }
}

Breakpoints.displayName = "Breakpoints";

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
