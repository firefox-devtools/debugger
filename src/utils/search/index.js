import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();
export const startSearchWorker = dispatcher.start.bind(dispatcher);
export const stopSearchWorker = dispatcher.stop.bind(dispatcher);

export const countMatches = dispatcher.task("countMatches");
