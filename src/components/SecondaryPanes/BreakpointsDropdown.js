// @flow
import React from "react";
import Svg from "../shared/Svg";
import Dropdown from "../shared/Dropdown";
import classnames from "classnames";

import "./BreakpointsDropdown.css";

function renderPause(isWaitingOnBreak) {
  const active = isWaitingOnBreak;
  return (
    <div
      className={classnames("pause-next", {
        active: active,
        inactive: !active
      })}
    >
      <img className="pause-next" />
      <span className="icon-spacer">{L10N.getStr("pauseButtonItem")}</span>
    </div>
  );
}

function renderPauseOnExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions
) {
  const active =
    (shouldPauseOnExceptions || shouldIgnoreCaughtExceptions) &&
    (!shouldPauseOnExceptions || !shouldIgnoreCaughtExceptions);
  return (
    <div
      className={classnames("pause-on-exceptions", {
        active: active,
        inactive: !active
      })}
    >
      <img className="pause-on-exceptions" />
      <span className="icon-spacer">
        {L10N.getStr("pauseOnExceptionsItem")}
      </span>
    </div>
  );
}

function renderPauseOnUncaughtExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions
) {
  const active = shouldPauseOnExceptions && shouldIgnoreCaughtExceptions;
  return (
    <div
      className={classnames("pause-uncaught-exceptions", {
        active: active,
        inactive: !active
      })}
    >
      <img className="pause-uncaught-exceptions" />
      <span className="icon-spacer">
        {L10N.getStr("pauseOnUncaughtExceptionsItem")}
      </span>
    </div>
  );
}

function renderIgnoreExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions
) {
  const active = !shouldPauseOnExceptions && !shouldIgnoreCaughtExceptions;
  return (
    <div
      className={classnames("ignore-exceptions", {
        active: active,
        inactive: !active
      })}
    >
      <img className="ignore-exceptions" />
      <span className="icon-spacer">{L10N.getStr("ignoreExceptionsItem")}</span>
    </div>
  );
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
      <li onClick={() => breakOnNext()} className="first">
        {renderPause(isWaitingOnBreak)}
      </li>
      <li onClick={() => pauseOnExceptions(false, false)}>
        {renderIgnoreExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions
        )}
      </li>
      <li onClick={() => pauseOnExceptions(true, true)}>
        {renderPauseOnUncaughtExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions
        )}
      </li>
      <li onClick={() => pauseOnExceptions(true, false)}>
        {renderPauseOnExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions
        )}
      </li>
    </ul>
  );

  const active =
    shouldPauseOnExceptions || shouldIgnoreCaughtExceptions || isWaitingOnBreak;

  return (
    <div
      className="breakpoints-dropdown"
      onClick={e => handleClick(e)}
      key="breakpoints-dropdown"
    >
      <Dropdown
        className="dropdown"
        panel={Panel}
        icon={
          <Svg
            name="plus"
            className={classnames("plus", {
              active: active,
              inactive: !active
            })}
          />
        }
      />
    </div>
  );
}
