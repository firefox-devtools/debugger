import { throttle } from "lodash";

let newSources;
let createSource;
let queuedSources;
let supportsWasm = false;

const queue = throttle(() => {
  if (!newSources || !createSource) {
    return;
  }
  newSources(
    queuedSources.map(source => {
      return createSource(source, { supportsWasm });
    })
  );
  queuedSources = [];
}, 100);

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
