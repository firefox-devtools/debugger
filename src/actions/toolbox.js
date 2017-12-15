/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

const { isDevelopment } = require("devtools-config");
const { getWorker } = require("../selectors");

import type { ThunkArgs } from "./types";

/**
 * @memberof actions/toolbox
 * @static
 */
export function openLink(url: string) {
  return async function({ openLink: openLinkCommand }: ThunkArgs) {
    if (isDevelopment()) {
      const win = window.open(url, "_blank");
      win.focus();
    } else {
      openLinkCommand(url);
    }
  };
}

export function openWorkerToolbox(url: string) {
  return async function({
    getState,
    openWorkerToolbox: openWorkerToolboxCommand
  }: ThunkArgs) {
    const worker = getWorker(getState(), url);
    if (isDevelopment()) {
      alert(url);
    } else {
      openWorkerToolboxCommand(worker);
    }
  };
}
