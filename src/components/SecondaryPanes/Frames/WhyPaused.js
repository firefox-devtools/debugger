// @flow
import { DOM as dom } from "react";
import isString from "lodash/isString";
import get from "lodash/get";

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
    return dom.div({ className: "message" }, message);
  }

  const exception = get(pauseInfo, "why.exception");
  if (exception) {
    return dom.div(
      { className: "message warning" },
      renderExceptionSummary(exception)
    );
  }

  return null;
}

export default function renderWhyPaused({ pause }: { pause: Pause }) {
  const reason = getPauseReason(pause);

  if (!reason) {
    return null;
  }

  return dom.div(
    { className: "pane why-paused" },
    dom.div(null, L10N.getStr(reason)),
    renderMessage(pause)
  );
}
