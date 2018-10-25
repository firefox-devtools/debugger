/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { throttle } from "lodash";
import type { Source } from "../types";

let newSources;
let createSource;
let supportsWasm = false;
let queuedSources;
let currentWork;

async function dispatchNewSources(): Promise<void> {
  const sources = queuedSources;
  queuedSources = [];

  currentWork = await newSources(
    sources.map(source => createSource(source, { supportsWasm }))
  );
}

const queue = throttle(dispatchNewSources, 100);

export default {
  initialize: (options: any) => {
    newSources = options.actions.newSources;
    createSource = options.createSource;
    supportsWasm = options.supportsWasm;
    queuedSources = [];
  },
  queue: (source: any) => {
    queuedSources.push(source);
    queue();
  },
  flush: () => Promise.all([queue.flush(), currentWork]),
  clear: () => queue.cancel()
};
