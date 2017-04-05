const mapValues = require("lodash/mapValues");
const injectDebuggee = require("./debuggee");
const {
  waitUntil,
  waitForSources,
  waitForTargetEvent,
  waitForPaused
} = require("./wait");


const { type, pressKey } = require("./type");

function info(msg) {
  console.log(`info: ${msg}\n`);
}

async function waitForTime(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, time);
  });
}

async function waitForElement(win, selector) {
  return waitUntil(() => win.document.querySelector(selector))
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

async function invokeInTab(dbg, fnc) {
  info(`invoking function ${fnc}()`);
  return dbg.client.debuggeeCommand(`${fnc}()`);
}

async function evalInTab(dbg, script) {
  info(`evaling script ${script}`);
  return dbg.client.debuggeeCommand(script);
}

function selectMenuItem(dbg, index) {
  const doc = dbg.win.document;

  const popup = doc.querySelector('menupopup[menu-api="true"]');
  const item = popup.querySelector(`menuitem:nth-child(${index})`);
  item.click();
}

function createDebuggerContext(iframe) {
  const win = iframe.contentWindow.window;

  const {
    store, selectors, actions, client,
    connection: { tabConnection: { threadClient, tabTarget }}
  } = win.getGlobalsForTesting();

  return {
    actions,
    selectors,
    store,
    client,
    threadClient,
    tabTarget,
    win,
    getState: store.getState
  };
}

async function waitForLoad(iframe) {
  return new Promise(resolve => {
    iframe.onload = resolve;
  });
}

async function waitForConnection(win) {
  return
}

async function createIframe() {
  let container = window["app-container"];
  let iframe = document.createElement("iframe");
  iframe.src = "http://localhost:8000";
  let id = document.createAttribute("id");
  id.value = "debuggerWindow";
  container.innerHTML = "";
  const loaded = waitForLoad(iframe);
  container.appendChild(iframe);
  await loaded;

  await waitForElement(iframe.contentWindow.window, ".tab");
  return iframe;
}

async function navigateToTab(iframe) {
  const win = iframe.contentWindow.window;
  const tabs = win.launchpadStore.getState().tabs.get("tabs");
  const tabId = tabs
    .find(t => {
      return t.get("clientType") == "firefox";
    })
    .get("id");

  await waitForElement(win, ".tab");
  win.location = `/?firefox-tab=${tabId}`;
  await waitForElement(win, ".debugger")
}

async function navigate(dbg, url) {
  dbg.client.navigate(`${url}`);

  return Promise.race([
    waitForPaused(dbg),
    waitForTargetEvent(dbg, "navigate")
  ]);
}

async function initDebugger(url, ...sources) {
  const iframe = await createIframe();
  await navigateToTab(iframe);
  const connected = waitForConnection(iframe.contentWindow.window);
  let dbg = createDebuggerContext(iframe);
  await navigate(dbg, `http://localhost:8000/integration/examples/${url}`);
  await connected;

  dbg = createDebuggerContext(iframe);
  await waitForSources(dbg, ...sources);
  return dbg;
}

function countSources(dbg) {
  const sources = dbg.selectors.getSources(dbg.getState());

  // the web test runner has one extra source because it injects the debuggee script
  return sources.size - 1;
}

function setupTestRunner() {}

module.exports = {
  invokeInTab,
  evalInTab,
  selectMenuItem,
  type,
  pressKey,
  countSources,
  initDebugger,
  setupTestRunner,
  info,
  environment: "mocha"
};
