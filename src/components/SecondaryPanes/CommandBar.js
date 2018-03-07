/* -*- indent-tabs-mode: nil; js-indent-level: 2; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import classnames from "classnames";
import { features } from "../../utils/prefs";
import {
  isPaused as getIsPaused,
  getIsWaitingOnBreak,
  getHistory,
  getHistoryPosition,
  getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions,
  getCanRewind
} from "../../selectors";
import { formatKeyShortcut } from "../../utils/text";
import actions from "../../actions";
import CommandBarButton from "../shared/Button/CommandBarButton";
import "./CommandBar.css";

import { Services } from "devtools-modules";
const { appinfo } = Services;

import type { SourceRecord, SourcesMap } from "../../reducers/sources";

const isMacOS = appinfo.OS === "Darwin";

const COMMANDS = ["resume", "stepOver", "stepIn", "stepOut"];

const KEYS = {
  WINNT: {
    resume: "F8",
    pause: "F8",
    stepOver: "F10",
    stepIn: "F11",
    stepOut: "Shift+F11"
  },
  Darwin: {
    resume: "Cmd+\\",
    pause: "Cmd+\\",
    stepOver: "Cmd+'",
    stepIn: "Cmd+;",
    stepOut: "Cmd+Shift+:",
    stepOutDisplay: "Cmd+Shift+;"
  },
  Linux: {
    resume: "F8",
    pause: "F8",
    stepOver: "F10",
    stepIn: "Ctrl+F11",
    stepOut: "Ctrl+Shift+F11"
  }
};

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

function debugBtn(
  onClick,
  type,
  className,
  tooltip,
  disabled = false,
  ariaPressed = false
) {
  return (
    <CommandBarButton
      className={classnames(type, className)}
      disabled={disabled}
      key={type}
      onClick={onClick}
      pressed={ariaPressed}
      title={tooltip}
    >
      <img className={type} />
    </CommandBarButton>
  );
}

type Props = {
  sources: SourcesMap,
  selectedSource: SourceRecord,
  resume: () => void,
  stepIn: () => void,
  stepOut: () => void,
  stepOver: () => void,
  breakOnNext: () => void,
  rewind: () => void,
  reverseStepIn: () => void,
  reverseStepOut: () => void,
  reverseStepOver: () => void,
  isPaused: boolean,
  pauseOnExceptions: (boolean, boolean) => void,
  shouldPauseOnExceptions: boolean,
  historyPosition: number,
  history: any,
  timeTravelTo: number => void,
  clearHistory: () => void,
  shouldIgnoreCaughtExceptions: boolean,
  isWaitingOnBreak: boolean,
  horizontal: boolean,
  canRewind: boolean
};

class CommandBar extends Component<Props> {
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

    if (isMacOS) {
      // The Mac supports both the Windows Function keys
      // as well as the Mac non-Function keys
      COMMANDS.forEach(action =>
        shortcuts.on(getKeyForOS("WINNT", action), (_, e) =>
          this.handleEvent(e, action)
        )
      );
    }
  }

  handleEvent(e, action) {
    e.preventDefault();
    e.stopPropagation();

    this.props[action]();
  }

  setHistory(offset) {
    this.props.timeTravelTo(this.props.historyPosition + offset);
  }

  renderStepButtons() {
    const { isPaused, canRewind } = this.props;
    const className = isPaused ? "active" : "disabled";
    const isDisabled = !isPaused;

    if (canRewind || (!isPaused && features.removeCommandBarOptions)) {
      return;
    }

    return [
      debugBtn(
        this.props.stepOver,
        "stepOver",
        className,
        L10N.getFormatStr("stepOverTooltip", formatKey("stepOver")),
        isDisabled
      ),
      debugBtn(
        this.props.stepIn,
        "stepIn",
        className,
        L10N.getFormatStr("stepInTooltip", formatKey("stepIn")),
        isDisabled
      ),
      debugBtn(
        this.props.stepOut,
        "stepOut",
        className,
        L10N.getFormatStr("stepOutTooltip", formatKey("stepOut")),
        isDisabled
      )
    ];
  }

  resume() {
    this.props.resume();
    this.props.clearHistory();
  }

  renderPauseButton() {
    const { isPaused, breakOnNext, isWaitingOnBreak, canRewind } = this.props;

    if (canRewind) {
      return;
    }

    if (isPaused) {
      return debugBtn(
        () => this.resume(),
        "resume",
        "active",
        L10N.getFormatStr("resumeButtonTooltip", formatKey("resume"))
      );
    }

    if (features.removeCommandBarOptions && !this.props.canRewind) {
      return;
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
    const {
      shouldPauseOnExceptions,
      shouldIgnoreCaughtExceptions,
      pauseOnExceptions,
      canRewind
    } = this.props;

    if (canRewind || features.breakpointsDropdown) {
      return;
    }

    if (!shouldPauseOnExceptions && !shouldIgnoreCaughtExceptions) {
      return debugBtn(
        () => pauseOnExceptions(true, true),
        "pause-exceptions",
        "enabled",
        L10N.getStr("ignoreExceptions"),
        false,
        false
      );
    }

    if (shouldPauseOnExceptions && shouldIgnoreCaughtExceptions) {
      return debugBtn(
        () => pauseOnExceptions(true, false),
        "pause-exceptions",
        "uncaught enabled",
        L10N.getStr("pauseOnUncaughtExceptions"),
        false,
        true
      );
    }

    return debugBtn(
      () => pauseOnExceptions(false, false),
      "pause-exceptions",
      "all enabled",
      L10N.getStr("pauseOnExceptions"),
      false,
      true
    );
  }

  renderTimeTravelButtons() {
    const { isPaused, canRewind } = this.props;

    if (!canRewind || !isPaused) {
      return null;
    }

    const isDisabled = !isPaused;

    return [
      debugBtn(this.props.rewind, "rewind", "active", "Rewind Execution"),

      debugBtn(
        () => this.props.resume,
        "resume",
        "active",
        L10N.getFormatStr("resumeButtonTooltip", formatKey("resume"))
      ),
      <div className="divider" />,
      debugBtn(
        this.props.reverseStepOver,
        "reverseStepOver",
        "active",
        "Reverse step over"
      ),
      debugBtn(
        this.props.stepOver,
        "stepOver",
        "active",
        L10N.getFormatStr("stepOverTooltip", formatKey("stepOver")),
        isDisabled
      ),
      <div className="divider" />,
      debugBtn(
        this.props.stepOut,
        "stepOut",
        "active",
        L10N.getFormatStr("stepOutTooltip", formatKey("stepOut")),
        isDisabled
      ),

      debugBtn(
        this.props.stepIn,
        "stepIn",
        "active",
        L10N.getFormatStr("stepInTooltip", formatKey("stepIn")),
        isDisabled
      )
    ];
  }

  replayPreviousButton() {
    const { history, historyPosition, canRewind } = this.props;
    const historyLength = history.length;

    if (canRewind || !historyLength || historyLength <= 1 || !features.replay) {
      return null;
    }

    const enabled = historyPosition === 0;
    const activeClass = enabled ? "replay-inactive" : "";
    return debugBtn(
      () => this.setHistory(-1),
      `replay-previous ${activeClass}`,
      "active",
      L10N.getStr("replayPrevious"),
      enabled
    );
  }

  replayNextButton() {
    const { history, historyPosition, canRewind } = this.props;
    const historyLength = history.length;

    if (canRewind || !historyLength || historyLength <= 1 || !features.replay) {
      return null;
    }

    const enabled = historyPosition + 1 === historyLength;
    const activeClass = enabled ? "replay-inactive" : "";
    return debugBtn(
      () => this.setHistory(1),
      `replay-next ${activeClass}`,
      "active",
      L10N.getStr("replayNext"),
      enabled
    );
  }

  renderStepPosition() {
    const { history, historyPosition, canRewind } = this.props;
    const historyLength = history.length;

    if (canRewind || !historyLength || !features.replay) {
      return null;
    }

    const position = historyPosition + 1;
    const total = historyLength;
    const activePrev = position > 1 ? "replay-active" : "replay-inactive";
    const activeNext = position < total ? "replay-active" : "replay-inactive";
    return (
      <div className="step-position">
        <span className={activePrev}>{position}</span>
        <span> | </span>
        <span className={activeNext}>{total}</span>
      </div>
    );
  }

  render() {
    return (
      <div
        className={classnames("command-bar", {
          vertical: !this.props.horizontal
        })}
      >
        {this.renderPauseButton()}
        {this.renderStepButtons()}
        {this.renderPauseOnExceptions()}
        {this.renderTimeTravelButtons()}
        <div className="filler" />
        {this.replayPreviousButton()}
        {this.renderStepPosition()}
        {this.replayNextButton()}
      </div>
    );
  }
}

CommandBar.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => {
    return {
      isPaused: getIsPaused(state),
      history: getHistory(state),
      historyPosition: getHistoryPosition(state),
      isWaitingOnBreak: getIsWaitingOnBreak(state),
      shouldPauseOnExceptions: getShouldPauseOnExceptions(state),
      shouldIgnoreCaughtExceptions: getShouldIgnoreCaughtExceptions(state),
      canRewind: getCanRewind(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(CommandBar);
