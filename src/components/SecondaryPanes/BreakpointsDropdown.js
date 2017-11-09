import React from "react";
import Svg from "../shared/Svg";
import Dropdown from "../shared/Dropdown";
import classnames from "classnames";

import "./BreakpointsDropdown.css";

function debugBtn(type, tooltip, className, state = "inactive") {
  return (
    <button className={classnames(className, state)}>
      <img className={className} title={tooltip} />
    </button>
  );
}

function renderPause(isWaitingOnBreak) {
  if (!isWaitingOnBreak) {
    return debugBtn(
      "pause",
      L10N.getFormatStr("pauseButtonTooltip"),
      "pause-next",
      "active"
    );
  }
  return debugBtn(
    "pause",
    L10N.getFormatStr("pauseButtonTooltip"),
    "pause-next"
  );
}

function renderPauseOnExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions
) {
  if (shouldPauseOnExceptions && shouldIgnoreCaughtExceptions) {
    return debugBtn(
      "pause-exceptions",
      L10N.getStr("pauseOnExceptionsTooltip"),
      "pause-on-exceptions",
      "active"
    );
  }
  return debugBtn(
    "pause-exceptions",
    L10N.getStr("ignoreExceptionsTooltip"),
    "pause-on-exceptions"
  );
}

function renderPauseOnUncaughtExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions
) {
  if (shouldPauseOnExceptions || shouldIgnoreCaughtExceptions) {
    return debugBtn(
      "pause-exceptions",
      L10N.getStr("pauseOnUncaughtExceptionsTooltip"),
      "pause-uncaught-exceptions",
      "active"
    );
  }
  return debugBtn(
    "pause-exceptions",
    L10N.getStr("ignoreExceptionsTooltip"),
    "pause-uncaught-exceptions"
  );
}

function renderIgnoreExceptions(
  shouldPauseOnExceptions,
  shouldIgnoreCaughtExceptions
) {
  if (!shouldPauseOnExceptions && !shouldIgnoreCaughtExceptions) {
    return debugBtn(
      "pause-exceptions",
      L10N.getStr("ignoreExceptionsTooltip"),
      "ignore-exceptions",
      "active"
    );
  }
  return debugBtn(
    "pause-exceptions",
    L10N.getStr("ignoreExceptionsTooltip"),
    "ignore-exceptions"
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
      <li onClick={() => breakOnNext()}>
        {renderPause(isWaitingOnBreak)}
        <span className="icon-spacer">{L10N.getStr("pauseButtonItem")}</span>
      </li>
      <li onClick={() => pauseOnExceptions(true, false)}>
        {renderPauseOnUncaughtExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions
        )}
        <span className="icon-spacer">
          {L10N.getStr("pauseOnUncaughtExceptionsItem")}
        </span>
      </li>
      <li onClick={() => pauseOnExceptions(false, false)}>
        {renderPauseOnExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions
        )}
        <span className="icon-spacer">
          {L10N.getStr("pauseOnExceptionsItem")}
        </span>
      </li>
      <li onClick={() => pauseOnExceptions(true, true)}>
        {renderIgnoreExceptions(
          shouldPauseOnExceptions,
          shouldIgnoreCaughtExceptions
        )}
        <span className="icon-spacer">
          {L10N.getStr("ignoreExceptionsItem")}
        </span>
      </li>
    </ul>
  );

  return (
    <div onClick={e => handleClick(e)}>
      <Dropdown className="dropdown" panel={Panel} icon={<Svg name="plus" />} />
    </div>
  );
}
