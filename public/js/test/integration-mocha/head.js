const mapValues = require("lodash/mapValues");

let actions = undefined;
let selectors = undefined;
let store = undefined;

function setupTestHelpers(opts) {
  actions = opts.actions;
  store = opts.store;
  selectors = mapValues(opts.selectors, (selector) => {
    return function() {
      return selector(store.getState(), ...arguments);
    };
  });
}

function selectSource(url) {
  const source = selectors.getSources()
                .find(s => s.get("url").includes(url));

  actions.selectSource(source.get("id"));
  return waitForTime(100);
}

function addBreakpoint(line, { source } = {}) {
  source = source || selectors.getSelectedSource();
  return actions.addBreakpoint({
    sourceId: source.get("id"),
    line
  }, {
    getTextForLine: l => window.cm.getLine(l - 1).trim()
  });
}

function removeBreakpoint(line) {
  const source = selectors.getSelectedSource();
  return actions.removeBreakpoint({
    sourceId: source.get("id"),
    line
  });
}

async function stepIn() {
  await actions.stepIn();
  return waitForPaused();
}

async function stepOver() {
  await actions.stepOver();
  return waitForPaused();
}

async function stepOut() {
  await actions.stepOut();
  return waitForPaused();
}

async function resume() {
  return actions.resume();
}

function waitForPaused() {
  return waitForDispatchDone(store, "PAUSED");
}

function debugTab() {
  const tabs = selectors.getTabs();
  const id = tabs.find(t => t.get("browser") == "firefox").get("id");
  window.location = `/?firefox-tab=${id}`;
}

function waitForTime(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, time);
  });
}

// Wait until an action of `type` is dispatched. If it's part of an
// async operation, wait until the `status` field is "done" or "error"
function waitForDispatchDone(_store, type) {
  return new Promise(resolve => {
    _store.dispatch({
      // Normally we would use `services.WAIT_UNTIL`, but use the
      // internal name here so tests aren't forced to always pass it
      // in
      type: "@@service/waitUntil",
      predicate: action => {
        if (action.type === type) {
          return action.status ?
            (action.status === "done" || action.status === "error") :
            true;
        }
      },
      run: (dispatch, getState, action) => {
        resolve(action);
      }
    });
  });
}

function pause() { // eslint-disable-line no-unused-vars
  debugger; // eslint-disable-line no-debugger
}

const commands = {
  selectSource,
  debugTab,
  addBreakpoint,
  removeBreakpoint,
  stepIn,
  stepOut,
  stepOver,
  resume,
  pause
};

const utils = {
  waitForTime,
  waitForPaused
};

module.exports = {
  setupTestHelpers,
  commands,
  utils
};
