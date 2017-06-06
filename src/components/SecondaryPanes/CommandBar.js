// @flow
import { DOM as dom, Component, PropTypes } from "react";

import { findDOMNode } from "react-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  getPause,
  getIsWaitingOnBreak,
  getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions
} from "../../selectors";
import Svg from "../shared/Svg";
import { formatKeyShortcut } from "../../utils/text";
import actions from "../../actions";
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
  return KEYS[os][action];
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

function handlePressAnimation(button) {
  if (!button) {
    return;
  }

  button.style.opacity = "0";
  button.style.transform = "scale(1.3)";
  setTimeout(() => {
    if (button) {
      button.style.opacity = "1";
      button.style.transform = "none";
    }
  }, 200);
}

function debugBtn(onClick, type, className, tooltip, disabled = false) {
  className = `${type} ${className}`;
  return dom.button(
    {
      onClick,
      className,
      key: type,
      "aria-label": tooltip,
      title: tooltip,
      disabled
    },
    Svg(type)
  );
}

class CommandBar extends Component {
  props: {
    sources: SourcesMap,
    selectedSource: SourceRecord,
    resume: () => any,
    stepIn: () => any,
    stepOut: () => any,
    stepOver: () => any,
    breakOnNext: () => any,
    pause: any,
    pauseOnExceptions: (boolean, boolean) => any,
    shouldPauseOnExceptions: boolean,
    shouldIgnoreCaughtExceptions: boolean,
    isWaitingOnBreak: boolean
  };

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
    const node = findDOMNode(this);
    if (node instanceof HTMLElement) {
      handlePressAnimation(node.querySelector(`.${action}`));
    }
  }

  renderStepButtons() {
    const isPaused = this.props.pause;
    const className = isPaused ? "active" : "disabled";
    const isDisabled = !this.props.pause;

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

  renderPauseButton() {
    const { pause, breakOnNext, isWaitingOnBreak } = this.props;

    if (pause) {
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
    const {
      shouldPauseOnExceptions,
      shouldIgnoreCaughtExceptions,
      pauseOnExceptions
    } = this.props;

    if (!shouldPauseOnExceptions && !shouldIgnoreCaughtExceptions) {
      return debugBtn(
        () => pauseOnExceptions(true, true),
        "pause-exceptions",
        "enabled",
        L10N.getStr("ignoreExceptions")
      );
    }

    if (shouldPauseOnExceptions && shouldIgnoreCaughtExceptions) {
      return debugBtn(
        () => pauseOnExceptions(true, false),
        "pause-exceptions",
        "uncaught enabled",
        L10N.getStr("pauseOnUncaughtExceptions")
      );
    }

    return debugBtn(
      () => pauseOnExceptions(false, false),
      "pause-exceptions",
      "all enabled",
      L10N.getStr("pauseOnExceptions")
    );
  }

  render() {
    return dom.div(
      { className: "command-bar" },
      this.renderPauseButton(),
      this.renderStepButtons(),
      this.renderPauseOnExceptions()
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
      isWaitingOnBreak: getIsWaitingOnBreak(state),
      shouldPauseOnExceptions: getShouldPauseOnExceptions(state),
      shouldIgnoreCaughtExceptions: getShouldIgnoreCaughtExceptions(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(CommandBar);
