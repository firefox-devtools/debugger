import { throttle } from "lodash";

let newSources;
let createSource;
let supportsWasm = false;
let queuedSources;

async function dispatchNewSources() {
  const sources = queuedSources;
  queuedSources = [];

  await newSources(
    sources.map(source => createSource(source, { supportsWasm }))
  );
}

const queue = throttle(dispatchNewSources, 100);

export default {
  initialize: options => {
    newSources = options.actions.newSources;
    createSource = options.createSource;
    supportsWasm = options.supportsWasm;
    queuedSources = [];
  },
  queue: source => {
    queuedSources.push(source);
    queue();
  },
  flush: () => queue.flush(),
  clear: () => queue.cancel()
};
