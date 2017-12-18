import { throttle } from "lodash";

let newSources = () =>
  console.error("sourceQueue: newSources must be initialized");
let createSource = () =>
  console.error("sourceQueue: createSource must be initialized");
let queuedSources = [];
let supportsWasm = false;
const queue = throttle(() => {
  newSources(
    queuedSources.map(source => {
      return createSource(source, { supportsWasm });
    })
  );
  queuedSources = [];
}, 100)();

export function initializeSourceQueue(options) {
  newSources = options.newSources;
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
