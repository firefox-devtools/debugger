import React from "react";
import Svg from "../shared/Svg";
import Dropdown from "../shared/Dropdown";
import classnames from "classnames";

import "./BreakpointsDropdown.css";

function renderPause(isWaitingOnBreak) {
  if (isWaitingOnBreak) {
    return (
      <div className={classnames("pause-next", "active")} >
        <img className="pause-next" />
        <span className="icon-spacer">{L10N.getStr("pauseButtonItem")}</span>
      </div>
      )
  }
  return (
    <div className={classnames("pause-next", "inactive")} >
        <img className="pause-next" />
        <span className="icon-spacer">{L10N.getStr("pauseButtonItem")}</span>
    </div>
      )
}

function renderPauseOnExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions,
  isWaitingOnBreak
) {
  if (!shouldPauseOnExceptions && !shouldIgnoreCaughtExceptions && !isWaitingOnBreak) {
    return (
      <div className={classnames("pause-on-exceptions", "active")} >
        <img className="pause-on-exceptions" />
        <span className="icon-spacer">{L10N.getStr("pauseOnExceptionsItem")}</span>
      </div>
      )
  }
  return (
    <div className={classnames("pause-on-exceptions", "inactive")} >
      <img className="pause-on-exceptions" />
      <span className="icon-spacer">{L10N.getStr("pauseOnExceptionsItem")}</span>
    </div>
      )
}

function renderPauseOnUncaughtExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions,
  isWaitingOnBreak
) {
  if (shouldPauseOnExceptions && !shouldIgnoreCaughtExceptions && !isWaitingOnBreak) {
    return (
      <div className={classnames("pause-uncaught-exceptions", "active")} >
        <img className="pause-uncaught-exceptions" />
        <span className="icon-spacer">{L10N.getStr("pauseOnUncaughtExceptionsItem")}</span>
      </div>
      )
  }
  return (
      <div className={classnames("pause-uncaught-exceptions", "inactive")} >
        <img className="pause-uncaught-exceptions" />
        <span className="icon-spacer">{L10N.getStr("pauseOnUncaughtExceptionsItem")}</span>
      </div>
      )
}

function renderIgnoreExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions,
  isWaitingOnBreak
) {
  if (shouldIgnoreCaughtExceptions && !isWaitingOnBreak) {
    return (
      <div className={classnames("ignore-exceptions", "active")} >
        <img className="ignore-exceptions" />
        <span className="icon-spacer">{L10N.getStr("ignoreExceptionsItem")}</span>
      </div>
      )
  }
  return (
      <div className={classnames("ignore-exceptions", "inactive")} >
        <img className="ignore-exceptions" />
        <span className="icon-spacer">{L10N.getStr("ignoreExceptionsItem")}</span>
      </div>
      )
}

function handleClick(e) {
  e.stopPropagation();
}

export default function renderBreakpointsDropdown(
  breakOnNext,
  pauseOnExceptions,
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions,
  isWaitingOnBreak
) {
  const Panel = (
    <ul>
      <li onClick={() => breakOnNext()}>
        {renderPause(isWaitingOnBreak)}
      </li>
      <li onClick={() => pauseOnExceptions(true, false)}>
        {renderPauseOnUncaughtExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions,
          isWaitingOnBreak
        )}
      </li>
      <li onClick={() => pauseOnExceptions(false, false)}>
        {renderPauseOnExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions,
          isWaitingOnBreak
        )}
      </li>
      <li onClick={() => pauseOnExceptions(true, true)}>
        {renderIgnoreExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions,
          isWaitingOnBreak
        )}
      </li>
    </ul>
  );

  return (
    <div className="breakpoints-dropdown" onClick={e => handleClick(e)}>
      <Dropdown className="dropdown" panel={Panel} icon={<Svg name="plus" />} />
    </div>
  );
}
