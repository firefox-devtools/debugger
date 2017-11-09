/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React from "react";
import { isString } from "lodash";
import { get } from "lodash";

import { getPauseReason } from "../../../utils/pause";
import type { Pause } from "debugger-html";

import "./WhyPaused.css";

function renderExceptionSummary(exception) {
  if (isString(exception)) {
    return exception;
  }

  const message = get(exception, "preview.message");
  const name = get(exception, "preview.name");

  return `${name}: ${message}`;
}

function renderMessage(pauseInfo: Pause) {
  if (!pauseInfo) {
    return null;
  }

  const message = get(pauseInfo, "why.message");
  if (message) {
    return <div className={"message"}>{message}</div>;
  }

  const exception = get(pauseInfo, "why.exception");
  if (exception) {
    return (
      <div className={"message warning"}>
        {renderExceptionSummary(exception)}
      </div>
    );
  }

  return null;
}

export default function renderWhyPaused({ pause }: { pause: Pause }) {
  const reason = getPauseReason(pause);

  if (!reason) {
    return null;
  }

  return (
    <div className={"pane why-paused"}>
      <div>{L10N.getStr(reason)}</div>
      {renderMessage(pause)}
    </div>
  );
}
renderWhyPaused.displayName = "whyPaused";
