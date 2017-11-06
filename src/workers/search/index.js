/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();
export const startSearchWorker = dispatcher.start.bind(dispatcher);
export const stopSearchWorker = dispatcher.stop.bind(dispatcher);

export const getMatches = dispatcher.task("getMatches");
export const searchSources = dispatcher.task("searchSources");
export const findSourceMatches = dispatcher.task("findSourceMatches");
