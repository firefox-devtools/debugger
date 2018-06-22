/* -*- indent-tabs-mode: nil; js-indent-level: 2; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";

import { connect } from "react-redux";
import classnames from "classnames";
import { features } from "../../utils/prefs";
import {
  isPaused as getIsPaused,
  getIsWaitingOnBreak,
  getHistory,
  getHistoryPosition,
  getCanRewind,
  getSkipPausing
} from "../../selectors";
import { formatKeyShortcut } from "../../utils/text";
import actions from "../../actions";
import { debugBtn } from "../shared/Button/CommandBarButton";
import "./CommandBar.css";

import { Services } from "devtools-modules";
const { appinfo } = Services;

import type { SourcesMap } from "../../reducers/sources";
import type { Source } from "../../types";

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

type Props = {
  sources: SourcesMap,
  selectedSource: Source,
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
  shouldPauseOnCaughtExceptions: boolean,
  historyPosition: number,
  history: any,
  timeTravelTo: number => void,
  clearHistory: () => void,
  isWaitingOnBreak: boolean,
  horizontal: boolean,
  canRewind: boolean,
  skipPausing: boolean,
  toggleSkipPausing: () => void
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
      <div key="divider-1" className="divider" />,
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
      <div key="divider-2" className="divider" />,
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

  renderSkipPausingButton() {
    const { skipPausing, toggleSkipPausing } = this.props;

    if (!features.skipPausing) {
      return null;
    }

    return (
      <button
        className={classnames(
          "command-bar-button",
          "command-bar-skip-pausing",
          {
            active: skipPausing
          }
        )}
        title={L10N.getStr("skipPausingTooltip")}
        onClick={toggleSkipPausing}
      >
        <img className="skipPausing" />
      </button>
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

        {this.renderTimeTravelButtons()}
        <div className="filler" />
        {this.replayPreviousButton()}
        {this.renderStepPosition()}
        {this.replayNextButton()}
        {this.renderSkipPausingButton()}
      </div>
    );
  }
}

CommandBar.contextTypes = {
  shortcuts: PropTypes.object
};

const mapStateToProps = state => ({
  isPaused: getIsPaused(state),
  history: getHistory(state),
  historyPosition: getHistoryPosition(state),
  isWaitingOnBreak: getIsWaitingOnBreak(state),
  canRewind: getCanRewind(state),
  skipPausing: getSkipPausing(state)
});

export default connect(mapStateToProps, actions)(CommandBar);
