// @flow
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { features } from "../../utils/prefs";
import ImPropTypes from "react-immutable-proptypes";

import actions from "../../actions";
import {
  getPause,
  getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions,
  getBreakpoints,
  getBreakpointsDisabled,
  getBreakpointsLoading,
  getIsWaitingOnBreak
} from "../../selectors";

import { isEnabled } from "devtools-config";
import Svg from "../shared/Svg";
import { prefs } from "../../utils/prefs";
import { formatKeyShortcut } from "../../utils/text";

import Breakpoints from "./Breakpoints";
import Expressions from "./Expressions";
import SplitBox from "devtools-splitter";
import Frames from "./Frames";
import EventListeners from "./EventListeners";
import Workers from "./Workers";
import Accordion from "../shared/Accordion";
import CommandBar from "./CommandBar";
import Dropdown from "../shared/Dropdown";
import UtilsBar from "./UtilsBar";

import _chromeScopes from "./ChromeScopes";
import _Scopes from "./Scopes";
import { Services } from "devtools-modules";
import "./SecondaryPanes.css";

const { appinfo } = Services;
const Scopes = isEnabled("chromeScopes") ? _chromeScopes : _Scopes;
const isMacOS = appinfo.OS === "Darwin";
const KEYS = {
  WINNT: {
    resume: "F8",
    pause: "F8"
  },
  Darwin: {
    resume: "Cmd+\\",
    pause: "Cmd+\\"
  },
  Linux: {
    resume: "F8",
    pause: "F8"
  }
};
const COMMANDS = ["resume", "pause"];

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

function getKey(action) {
  return getKeyForOS(appinfo.OS, action);
}

function getKeyForOS(os, action) {
  const osActions = KEYS[os] || KEYS.Linux;
  return osActions[action];
}

function formatKey(action) {
  const key = getKey(`${action}Display`) || getKey(action);
  if (isMacOS) {
    const winKey =
      getKeyForOS("WINNT", `${action}Display`) || getKeyForOS("WINNT", action);
    // display both Windows type and Mac specific keys
    return formatKeyShortcut([key, winKey].join(" "));
  }
  return formatKeyShortcut(key);
}

type Props = {
  evaluateExpressions: Function,
  pauseData: Object,
  horizontal: boolean,
  breakpoints: Object,
  breakpointsDisabled: boolean,
  breakpointsLoading: boolean,
  toggleAllBreakpoints: Function,
  toggleShortcutsModal: Function,
  pause: any,
  resume: any,
  pauseOnExceptions: (boolean, boolean) => void,
  breakOnNext: () => void,
  isWaitingOnBreak: any,
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean
};

class SecondaryPanes extends Component<Props> {
  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    COMMANDS.forEach(action => shortcuts.off(getKey(action)));
    if (isMacOS) {
      COMMANDS.forEach(action => shortcuts.off(getKeyForOS("WINNT", action)));
    }
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;

    COMMANDS.forEach(action =>
      shortcuts.on(getKey(action), (_, e) => this.handleEvent(e, action))
    );
  }

  renderBreakpointsToggle() {
    const {
      toggleAllBreakpoints,
      breakpoints,
      breakpointsDisabled,
      breakpointsLoading
    } = this.props;
    const boxClassName = "breakpoints-toggle";
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
      className: boxClassName,
      disabled: breakpointsLoading,
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

    if (!features.breakpointsDropdown) {
      return <input {...inputProps} />;
    }

    return (
      <div className="breakpoints-buttons">
        {this.renderBreakpointsDropdown()}
        <input {...inputProps} />
      </div>
    );
  }

  renderPauseButton() {
    const { pauseData, breakOnNext, isWaitingOnBreak } = this.props;

    if (pauseData) {
      return debugBtn(
        this.props.resume,
        "resume",
        "active",
        L10N.getFormatStr("resumeButtonTooltip", formatKey("resume"))
      );
    }

    if (isWaitingOnBreak) {
      return debugBtn(
        null,
        "pause",
        "disabled",
        L10N.getStr("pausePendingButtonTooltip"),
        true
      );
    }

    return debugBtn(
      breakOnNext,
      "pause",
      "active",
      L10N.getFormatStr("pauseButtonTooltip", formatKey("pause"))
    );
  }

  /*
   * The pause on exception button has three states in this order:
   *  1. don't pause on exceptions      [false, false]
   *  2. pause on uncaught exceptions   [true, true]
   *  3. pause on all exceptions        [true, false]
  */
  renderPauseOnExceptions() {
    return debugBtn(
      () => actions.pauseOnExceptions(false, false),
      "pause-exceptions",
      "all enabled",
      L10N.getStr("pauseOnExceptions")
    );
  }

  renderPauseOnUncaughtExceptions() {
    return debugBtn(
      () => actions.pauseOnExceptions(true, false),
      "pause-exceptions",
      "uncaught enabled",
      L10N.getStr("pauseOnUncaughtExceptions")
    );
  }

  renderIgnoreExceptions() {
    return debugBtn(
      () => actions.pauseOnExceptions(true, true),
      "pause-exceptions",
      "enabled",
      L10N.getStr("ignoreExceptions")
    );
  }

  renderBreakpointsDropdown() {
    const Panel = (
      <ul>
        <li> {this.renderPauseButton()} Pause on Next Statement</li>
        <li>
          {" "}
          {this.renderPauseOnUncaughtExceptions()} Pause on Uncaught Exceptions
        </li>
        <li> {this.renderPauseOnExceptions()} Pause on Exceptions </li>
        <li> {this.renderIgnoreExceptions()} Ignore Exceptions </li>
      </ul>
    );

    return (
      <Dropdown class="dropdown" panel={Panel} icon={<Svg name="plus" />} />
    );
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
    const isPaused = () => !!this.props.pauseData;

    return {
      header: L10N.getStr("scopes.header"),
      component: Scopes,
      opened: prefs.scopesVisible,
      onToggle: opened => {
        prefs.scopesVisible = opened;
      },
      shouldOpen: isPaused
    };
  }

  getWatchItem() {
    return {
      header: L10N.getStr("watchExpressions.header"),
      buttons: this.watchExpressionHeaderButtons(),
      component: Expressions,
      opened: true
    };
  }

  getStartItems() {
    const scopesContent: any = this.props.horizontal
      ? this.getScopeItem()
      : null;
    const isPaused = () => !!this.props.pauseData;

    const items: Array<SecondaryPanesItems> = [
      {
        header: L10N.getStr("breakpoints.header"),
        buttons: this.renderBreakpointsToggle(),
        component: Breakpoints,
        opened: true
      },
      {
        header: L10N.getStr("callStack.header"),
        component: Frames,
        opened: prefs.callStackVisible,
        onToggle: opened => {
          prefs.callStackVisible = opened;
        },
        shouldOpen: isPaused
      },
      scopesContent
    ];

    if (isEnabled("eventListeners")) {
      items.push({
        header: L10N.getStr("eventListenersHeader"),
        component: EventListeners
      });
    }

    if (isEnabled("workers")) {
      items.push({
        header: L10N.getStr("workersHeader"),
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

    if (!this.props.horizontal) {
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

SecondaryPanes.propTypes = {
  evaluateExpressions: PropTypes.func.isRequired,
  pauseData: PropTypes.object,
  horizontal: PropTypes.bool,
  breakpoints: ImPropTypes.map.isRequired,
  breakpointsDisabled: PropTypes.bool,
  breakpointsLoading: PropTypes.bool,
  toggleAllBreakpoints: PropTypes.func.isRequired,
  toggleShortcutsModal: PropTypes.func
};

SecondaryPanes.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => ({
    pauseData: getPause(state),
    breakpoints: getBreakpoints(state),
    breakpointsDisabled: getBreakpointsDisabled(state),
    breakpointsLoading: getBreakpointsLoading(state),
    shouldPauseOnExceptions: getShouldPauseOnExceptions(state),
    shouldIgnoreCaughtExceptions: getShouldIgnoreCaughtExceptions(state),
    isWaitingOnBreak: getIsWaitingOnBreak(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SecondaryPanes);
