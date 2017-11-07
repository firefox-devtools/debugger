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

function renderPause() {
  return debugBtn("pause", L10N.getFormatStr("pauseButtonItem"));
}

function renderPauseOnExceptions() {
  return debugBtn("pause-exceptions", L10N.getStr("pauseOnExceptionsTooltip"));
}

function renderPauseOnUncaughtExceptions() {
  return debugBtn("pause-exceptions", L10N.getStr("pauseOnUncaughtExceptions"));
}

function renderIgnoreExceptions() {
  return debugBtn("pause-exceptions", L10N.getStr("ignoreExceptionsItem"));
}

function handleClick(e) {
	e.stopPropagation();
}

export default function renderBreakpointsDropdown(
  breakOnNext,
  pauseOnExceptions
) {
  const Panel = (
    <ul>
      <li onClick={() => breakOnNext()}>
        {renderPause()}
        <span className="icon-spacer">{L10N.getStr("pauseButtonItem")}</span>
      </li>
      <li onClick={() => pauseOnExceptions(true, false)}>
        {renderPauseOnUncaughtExceptions()}
        <span className="icon-spacer">
          {L10N.getStr("pauseOnUncaughtExceptionsItem")}
        </span>
      </li>
      <li onClick={() => pauseOnExceptions(false, false)}>
        {renderPauseOnExceptions()}
        <span className="icon-spacer">
          {L10N.getStr("pauseOnExceptionsItem")}
        </span>
      </li>
      <li onClick={() => pauseOnExceptions(true, true)}>
        {renderIgnoreExceptions()}
        <span className="icon-spacer">
          {L10N.getStr("ignoreExceptionsItem")}
        </span>
      </li>
    </ul>
  );

  return (
  	<div onClick={e => handleClick(e)}>
  	<Dropdown class="dropdown" panel={Panel} icon={<Svg name="plus" />} />
  	</div>
  	);
}