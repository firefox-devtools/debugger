import { throttle } from "lodash";

let newSources;
let createSource;
let queuedSources = [];
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
}, 100)();

export function initializeSourceQueue(options) {
  newSources = options.actions.newSources;
  createSource = options.createSource;
  supportsWasm = options.supportsWasm;
}

export function queueSource(source) {
  queuedSources.push(source);
  queue();
}

export function flushSourceQueue() {
  queue.flush();
}

export function clearSourceQueue() {
  queue.cancel();
}
