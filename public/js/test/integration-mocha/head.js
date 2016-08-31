const mapValues = require("lodash/mapValues");
const injectDebuggee = require("../utils/debuggee");

let actions = undefined;
let selectors = undefined;
let store = undefined;
let debuggerWindow = undefined;

function initDebugger(iframe) {
  debuggerWindow = iframe.contentWindow.window;
  const objs = debuggerWindow.bootstrap();

  actions = objs.actions;
  store = objs.store;
  selectors = mapValues(objs.selectors, (selector) => {
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
    getTextForLine: l => debuggerWindow.cm.getLine(l - 1).trim()
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

async function prettyPrint({ source } = {}) {
  source = source || selectors.getSelectedSource();
  return actions.togglePrettyPrint(source.get("id"));
}

function waitForPaused() {
  return waitForDispatchDone(store, "PAUSED");
}

async function loadDebugger() {
  let container = window["app-container"];
  let iframe = document.createElement("iframe");
  iframe.src = "http://localhost:8000";
  let id = document.createAttribute("id");
  id.value = "debuggerWindow";
  container.innerHTML = "";
  container.appendChild(iframe);
  await waitForTime(1000);
  initDebugger(iframe);

  const tabs = selectors.getTabs();
  const tabId = tabs.find(t => t.get("browser") == "firefox").get("id");
  debuggerWindow.location = `/?firefox-tab=${tabId}`;
  await waitForTime(2000);
  initDebugger(iframe);
  return iframe;
}

function navigate(url) {
  debuggerWindow.client.navigate(`/${url}`);
  return waitForTime(1000);
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

async function debuggee(callback) {
  /**
   * gets a fat arrow function and returns the function body
   * `() => { example }` => `example`
   */
  function getFunctionBody(cb) {
    const source = cb.toString();
    const firstCurly = source.toString().indexOf("{");
    return source.slice(firstCurly + 1, -1).trim();
  }

  const script = getFunctionBody(callback);

  await injectDebuggee(debuggerWindow);
  return debuggerWindow.client.debuggeeCommand(script);
}

const commands = {
  selectSource,
  loadDebugger,
  navigate,
  addBreakpoint,
  removeBreakpoint,
  stepIn,
  stepOut,
  stepOver,
  resume,
  prettyPrint
};

const utils = {
  waitForTime,
  waitForPaused,
  debuggee
};

module.exports = {
  initDebugger,
  commands,
  utils
};
