import React from "react";
import Svg from "../shared/Svg";
import Dropdown from "../shared/Dropdown";
import "./BreakpointsDropdown.css";

function debugBtn(type, tooltip) {
  return (
    <button className="button-spacer">
      <Svg name={type} title={tooltip} aria-label={tooltip} />
    </button>
  );
}

function renderPause(pauseData, isWaitingOnBreak) {
  if (pauseData) {
    return debugBtn("resume", L10N.getFormatStr("resumeButton"));
  }

  if (isWaitingOnBreak) {
    return debugBtn("pause", L10N.getStr("pausePendingButtonTooltip"));
  }

  return debugBtn("pause", L10N.getFormatStr("pauseButton"));
}

function renderPauseOnExceptions() {
  return debugBtn("pause-exceptions", L10N.getStr("pauseOnExceptionsTooltip"));
}

function renderPauseOnUncaughtExceptions() {
  return debugBtn(
    "pause-exceptions",
    L10N.getStr("pauseOnUncaughtExceptionsTooltip")
  );
}

function renderIgnoreExceptions() {
  return debugBtn("pause-exceptions", L10N.getStr("ignoreExceptionsTooltip"));
}

export default function renderBreakpointsDropdown(
  breakOnNext,
  pauseOnExceptions,
  pauseData,
  isWaitingOnBreak
) {
  const Panel = (
    <ul>
      <li onClick={() => breakOnNext()}>
        {renderPause(pauseData, isWaitingOnBreak)}
        <span className="icon-spacer">{L10N.getStr("pauseButton")}</span>
      </li>
      <li onClick={() => pauseOnExceptions(true, false)}>
        {renderPauseOnUncaughtExceptions()}
        <span className="icon-spacer">
          {L10N.getStr("pauseOnUncaughtExceptions")}
        </span>
      </li>
      <li onClick={() => pauseOnExceptions(false, false)}>
        {renderPauseOnExceptions()}
        <span className="icon-spacer">{L10N.getStr("pauseOnExceptions")}</span>
      </li>
      <li onClick={() => pauseOnExceptions(true, true)}>
        {renderIgnoreExceptions()}
        <span className="icon-spacer">{L10N.getStr("ignoreExceptions")}</span>
      </li>
    </ul>
  );

  return <Dropdown class="dropdown" panel={Panel} icon={<Svg name="plus" />} />;
}
