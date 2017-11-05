import React from "react";
import Svg from "../shared/Svg";
import Dropdown from "../shared/Dropdown";

export default function renderBreakpointsDropdown(_this, actions) {
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

  function renderPauseButton() {
    const { pauseData, isWaitingOnBreak } = _this.props;

    if (pauseData) {
      return debugBtn(
        () => actions.resume(),
        "resume",
        "active",
        L10N.getFormatStr("resumeButton")
      );
    }

    if (isWaitingOnBreak) {
      return debugBtn(
        null,
        "pause",
        "disabled",
        L10N.getStr("pausePendingButtonTooltip")
      );
    }

    return debugBtn(
      () => actions.breakOnNext(),
      "pause",
      "active",
      L10N.getFormatStr("pauseButton")
    );
  }

  /*
	* The pause on exception button has three states in this order:
	*  1. don't pause on exceptions      [false, false]
	*  2. pause on uncaught exceptions   [true, true]
	*  3. pause on all exceptions        [true, false]
	*/
  function renderPauseOnExceptions() {
    return debugBtn(
      () => actions.pauseOnExceptions(false, false),
      "pause-exceptions",
      "all enabled",
      L10N.getStr("pauseOnExceptionsTooltip")
    );
  }

  function renderPauseOnUncaughtExceptions() {
    return debugBtn(
      () => actions.pauseOnExceptions(true, false),
      "pause-exceptions",
      "uncaught enabled",
      L10N.getStr("pauseOnUncaughtExceptionsTooltip")
    );
  }

  function renderIgnoreExceptions() {
    return debugBtn(
      () => actions.pauseOnExceptions(true, true),
      "pause-exceptions",
      "enabled",
      L10N.getStr("ignoreExceptionsTooltip")
    );
  }

  const Panel = (
    <ul>
      <li onClick={renderPauseButton}>{L10N.getStr("pauseButton")}</li>
      <li onClick={renderPauseOnUncaughtExceptions}>
        {L10N.getStr("pauseOnUncaughtExceptions")}
      </li>
      <li onClick={renderPauseOnExceptions}>
        {L10N.getStr("pauseOnExceptions")}
      </li>
      <li onClick={renderIgnoreExceptions}>
        {L10N.getStr("ignoreExceptions")}
      </li>
    </ul>
  );

  return <Dropdown class="dropdown" panel={Panel} icon={<Svg name="plus" />} />;
}
