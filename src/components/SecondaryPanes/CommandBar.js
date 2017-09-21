// @flow
import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import classnames from "classnames";
import {
  getPause,
  getIsWaitingOnBreak,
  getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions,
  isPaused as getIsPaused,
  isStepping as getIsStepping
} from "../../selectors";

import {
  COMMANDS,
  getKey,
  getKeyForOS,
  isMacOS,
  formatKey
} from "../../utils/steppingShortcuts";
import actions from "../../actions";
import debugBtn from "../shared/debugBtn";
import "./CommandBar.css";

import type { SourceRecord, SourcesMap } from "../../reducers/sources";

debugBtn.displayName = "CommandBarButton";

type Props = {
  sources: SourcesMap,
  selectedSource: SourceRecord,
  resume: () => void,
  stepIn: () => void,
  stepOut: () => void,
  stepOver: () => void,
  breakOnNext: () => void,
  pause: any,
  pauseOnExceptions: (boolean, boolean) => void,
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean,
  isWaitingOnBreak: boolean,
  horizontal: boolean,
  isPaused: boolean,
  isStepping: boolean
};

class CommandBar extends Component {
  props: Props;

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

  renderStepButtons() {
    const { isStepping, isPaused } = this.props;
    const className = isPaused ? "active" : "disabled";
    const isDisabled = !isPaused;

    console.log({ isPaused, isStepping });
    if (!isPaused && !isStepping) {
      return;
    }

    return [
      debugBtn(
        this.props.resume,
        "resume",
        "active",
        L10N.getFormatStr("resumeButtonTooltip", formatKey("resume"))
      ),

      debugBtn(
        this.props.stepOver,
        "stepOver",
        className,
        L10N.getFormatStr("stepOverTooltip", formatKey("stepOver")),
        false
      ),
      debugBtn(
        this.props.stepIn,
        "stepIn",
        className,
        L10N.getFormatStr("stepInTooltip", formatKey("stepIn")),
        false
      ),
      debugBtn(
        this.props.stepOut,
        "stepOut",
        className,
        L10N.getFormatStr("stepOutTooltip", formatKey("stepOut")),
        false
      )
    ];
  }

  renderPauseButton() {
    const { breakOnNext, isWaitingOnBreak, isPaused } = this.props;

    if (isWaitingOnBreak) {
      return debugBtn(
        null,
        "pause",
        "disabled",
        L10N.getStr("pausePendingButtonTooltip"),
        true
      );
    }

    return null;
  }

  /*
   * The pause on exception button has three states in this order:
   *  1. don't pause on exceptions      [false, false]
   *  2. pause on uncaught exceptions   [true, true]
   *  3. pause on all exceptions        [true, false]
  */
  renderPauseOnExceptions() {
    return null;
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
      </div>
    );
  }
}

CommandBar.contextTypes = {
  shortcuts: PropTypes.object
};

CommandBar.displayName = "CommandBar";

export default connect(
  state => {
    return {
      pause: getPause(state),
      isPaused: getIsPaused(state),
      isStepping: getIsStepping(state),
      isWaitingOnBreak: getIsWaitingOnBreak(state),
      shouldPauseOnExceptions: getShouldPauseOnExceptions(state),
      shouldIgnoreCaughtExceptions: getShouldIgnoreCaughtExceptions(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(CommandBar);
