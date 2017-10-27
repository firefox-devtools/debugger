import { isTesting } from "devtools-config";

const blacklist = [
  "LOAD_OBJECT_PROPERTIES",
  "SET_SYMBOLS",
  "OUT_OF_SCOPE_LOCATIONS"
];

function cloneAction(action) {
  action = action || {};
  action = { ...action };

  // ADD_TAB, ...
  if (action.source && action.source.text) {
    const source = { ...action.source, text: "" };
    action.source = source;
  }

  // LOAD_SOURCE_TEXT
  if (action.text) {
    action.text = "";
  }

  if (action.value && action.value.text) {
    const value = { ...action.value, text: "" };
    action.value = value;
  }

  return action;
}

function formatFrame(frame) {
  const { id, location, displayName } = frame;
  return { id, location, displayName };
}

function formatPause(pause) {
  return {
    ...pause,
    pauseInfo: { why: pause.pauseInfo.why },
    scopes: [],
    frames: pause.frames.map(formatFrame),
    loadedObjects: []
  };
}

function serializeAction(action) {
  try {
    action = cloneAction(action);
    if (blacklist.includes(action.type)) {
      action = {};
    }

    if (action.type === "PAUSED") {
      action = formatPause(action);
    }

    // dump(`> ${action.type}...\n ${JSON.stringify(action)}\n`);
    return JSON.stringify(action);
  } catch (e) {
    console.error(e);
  }
}

/**
 * A middleware that logs all actions coming through the system
 * to the console.
 */
export function log({ dispatch, getState }) {
  return next => action => {
    const asyncMsg = !action.status ? "" : `[${action.status}]`;

    if (isTesting()) {
      dump(
        `[ACTION] ${action.type} ${asyncMsg} - ${serializeAction(action)}\n`
      );
    } else {
      console.log(action, asyncMsg);
    }

    next(action);
  };
}
