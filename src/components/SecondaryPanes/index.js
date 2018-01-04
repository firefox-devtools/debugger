/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { features } from "../../utils/prefs";

import actions from "../../actions";
import {
  isPaused as getIsPaused,
  getBreakpoints,
  getBreakpointsDisabled,
  getBreakpointsLoading,
  getIsWaitingOnBreak,
  getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions
} from "../../selectors";

import { isEnabled } from "devtools-config";
import Svg from "../shared/Svg";
import { prefs } from "../../utils/prefs";

import Breakpoints from "./Breakpoints";
import Expressions from "./Expressions";
import SplitBox from "devtools-splitter";
import Frames from "./Frames";
import EventListeners from "./EventListeners";
import Workers from "./Workers";
import Accordion from "../shared/Accordion";
import CommandBar from "./CommandBar";
import UtilsBar from "./UtilsBar";
import renderBreakpointsDropdown from "./BreakpointsDropdown";

import _chromeScopes from "./ChromeScopes";
import _Scopes from "./Scopes";

const Scopes = isEnabled("chromeScopes") ? _chromeScopes : _Scopes;

import "./SecondaryPanes.css";

type SecondaryPanesItems = {
  header: string,
  component: any,
  opened?: boolean,
  onToggle?: () => void,
  shouldOpen?: () => boolean,
  buttons?: any
};

function debugBtn(onClick, type, className, tooltip) {
  return (
    <button
      onClick={onClick}
      className={`${type} ${className}`}
      key={type}
      title={tooltip}
    >
      <Svg name={type} title={tooltip} aria-label={tooltip} />
    </button>
  );
}

type Props = {
  evaluateExpressions: Function,
  isPaused: boolean,
  horizontal: boolean,
  breakpoints: Object,
  breakpointsDisabled: boolean,
  breakpointsLoading: boolean,
  toggleAllBreakpoints: Function,
  toggleShortcutsModal: Function,
  pauseOnExceptions: (boolean, boolean) => void,
  breakOnNext: () => void,
  isWaitingOnBreak: any,
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean
};

class SecondaryPanes extends Component<Props> {
  renderBreakpointsToggle() {
    const {
      toggleAllBreakpoints,
      breakpoints,
      breakpointsDisabled,
      breakpointsLoading
    } = this.props;
    const isIndeterminate =
      !breakpointsDisabled && breakpoints.some(x => x.disabled);

    if (breakpoints.size == 0) {
      return null;
    }

    const inputProps = {
      type: "checkbox",
      "aria-label": breakpointsDisabled
        ? L10N.getStr("breakpoints.enable")
        : L10N.getStr("breakpoints.disable"),
      className: "breakpoints-toggle",
      disabled: breakpointsLoading,
      key: "breakpoints-toggle",
      onChange: e => {
        e.stopPropagation();
        toggleAllBreakpoints(!breakpointsDisabled);
      },
      onClick: e => e.stopPropagation(),
      checked: !breakpointsDisabled && !isIndeterminate,
      ref: input => {
        if (input) {
          input.indeterminate = isIndeterminate;
        }
      },
      title: breakpointsDisabled
        ? L10N.getStr("breakpoints.enable")
        : L10N.getStr("breakpoints.disable")
    };

    return <input {...inputProps} />;
  }

  watchExpressionHeaderButtons() {
    return [
      debugBtn(
        evt => {
          evt.stopPropagation();
          this.props.evaluateExpressions();
        },
        "refresh",
        "refresh",
        L10N.getStr("watchExpressions.refreshButton")
      )
    ];
  }

  getScopeItem() {
    return {
      header: L10N.getStr("scopes.header"),
      className: "scopes-pane",
      component: Scopes,
      opened: prefs.scopesVisible,
      onToggle: opened => {
        prefs.scopesVisible = opened;
      }
    };
  }

  getWatchItem() {
    return {
      header: L10N.getStr("watchExpressions.header"),
      className: "watch-expressions-pane",
      buttons: this.watchExpressionHeaderButtons(),
      component: Expressions,
      opened: true
    };
  }

  getCallStackItem() {
    return {
      header: L10N.getStr("callStack.header"),
      className: "call-stack-pane",
      component: Frames,
      opened: prefs.callStackVisible,
      onToggle: opened => {
        prefs.callStackVisible = opened;
      }
    };
  }

  getBreakpointsItem() {
    return {
      header: L10N.getStr("breakpoints.header"),
      className: "breakpoints-pane",
      buttons: [this.breakpointDropdown(), this.renderBreakpointsToggle()],
      component: Breakpoints,
      opened: true
    };
  }

  breakpointDropdown() {
    if (!features.breakpointsDropdown) {
      return;
    }

    const {
      breakOnNext,
      pauseOnExceptions,
      shouldPauseOnExceptions,
      shouldIgnoreCaughtExceptions,
      isWaitingOnBreak
    } = this.props;

    return renderBreakpointsDropdown(
      breakOnNext,
      pauseOnExceptions,
      shouldPauseOnExceptions,
      shouldIgnoreCaughtExceptions,
      isWaitingOnBreak
    );
  }

  getStartItems() {
    const items: Array<SecondaryPanesItems> = [];
    items.push(this.getBreakpointsItem());

    if (this.props.isPaused) {
      if (this.props.horizontal) {
        items.push(this.getScopeItem());
      }
      items.push(this.getCallStackItem());
    }

    if (isEnabled("eventListeners")) {
      items.push({
        header: L10N.getStr("eventListenersHeader"),
        className: "event-listeners-pane",
        component: EventListeners
      });
    }

    if (features.workers) {
      items.push({
        header: L10N.getStr("workersHeader"),
        className: "workers-pane",
        component: Workers
      });
    }

    if (this.props.horizontal) {
      items.unshift(this.getWatchItem());
    }

    return items.filter(item => item);
  }

  renderHorizontalLayout() {
    return <Accordion items={this.getItems()} />;
  }

  getEndItems() {
    const items: Array<SecondaryPanesItems> = [];

    if (!this.props.horizontal && this.props.isPaused) {
      items.unshift(this.getScopeItem());
    }

    if (!this.props.horizontal) {
      items.unshift(this.getWatchItem());
    }

    return items;
  }

  getItems() {
    return [...this.getStartItems(), ...this.getEndItems()];
  }

  renderVerticalLayout() {
    return (
      <SplitBox
        initialSize="300px"
        minSize={10}
        maxSize="50%"
        splitterSize={1}
        startPanel={<Accordion items={this.getStartItems()} />}
        endPanel={<Accordion items={this.getEndItems()} />}
      />
    );
  }

  renderUtilsBar() {
    if (!features.shortcuts) {
      return;
    }

    return (
      <UtilsBar
        horizontal={this.props.horizontal}
        toggleShortcutsModal={this.props.toggleShortcutsModal}
      />
    );
  }

  render() {
    return (
      <div className="secondary-panes-wrapper">
        <CommandBar horizontal={this.props.horizontal} />
        <div className="secondary-panes">
          {this.props.horizontal
            ? this.renderHorizontalLayout()
            : this.renderVerticalLayout()}
        </div>
        {this.renderUtilsBar()}
      </div>
    );
  }
}

SecondaryPanes.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => ({
    isPaused: getIsPaused(state),
    breakpoints: getBreakpoints(state),
    breakpointsDisabled: getBreakpointsDisabled(state),
    breakpointsLoading: getBreakpointsLoading(state),
    isWaitingOnBreak: getIsWaitingOnBreak(state),
    shouldPauseOnExceptions: getShouldPauseOnExceptions(state),
    shouldIgnoreCaughtExceptions: getShouldIgnoreCaughtExceptions(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SecondaryPanes);
