import React from "react";
import Svg from "../shared/Svg";
import Dropdown from "../shared/Dropdown";
import classnames from "classnames";

import "./BreakpointsDropdown.css";

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
        <div
          className="pause-exceptions"
          title={L10N.getStr("pauseButtonTooltip")}
        />
        <span className="icon-spacer">{L10N.getStr("pauseButtonItem")}</span>
      </li>
      <li onClick={() => pauseOnExceptions(true, false)}>
        <div
          className="pause-exceptions uncaught"
          title={L10N.getStr("pauseOnUncaughtExceptionsTooltip")}
        />
        <span className="icon-spacer">
          {L10N.getStr("pauseOnUncaughtExceptionsItem")}
        </span>
      </li>
      <li onClick={() => pauseOnExceptions(false, false)}>
        <div
          className="pause-exceptions.all"
          title={L10N.getStr("pauseOnExceptionsTooltip")}
        />
        <span className="icon-spacer">
          {L10N.getStr("pauseOnExceptionsItem")}
        </span>
      </li>
      <li onClick={() => pauseOnExceptions(true, true)}>
        <div
          className="pause-exceptions"
          title={L10N.getStr("ignoreExceptionsTooltip")}
        />
        <span className="icon-spacer">
          {L10N.getStr("ignoreExceptionsItem")}
        </span>
      </li>
    </ul>
  );

  return (
    <div className="breakpoints-dropdown" onClick={e => handleClick(e)}>
      <Dropdown className="dropdown" panel={Panel} icon={<Svg name="plus" />} />
    </div>
  );
}
