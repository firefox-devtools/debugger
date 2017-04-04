const mapValues = require("lodash/mapValues");
const injectDebuggee = require("./debuggee");
const {
  waitForElement,
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

  const globals = win.getGlobalsForTesting();
  const { debuggerStore: store, selectors } = globals;

  return {
    actions: globals.actions,
    selectors: globals.selectors,
    getState: store.getState,
    store,
    client: win.client,
    threadClient: globals.threadClient,
    tabTarget: globals.target,
    win: win,
    launchpadStore: globals.launchpadStore
  };
}

async function waitForLoad(iframe) {
  return new Promise(resolve => {
    iframe.onload = resolve;
  });
}

async function waitForConnection(win) {
  return new Promise(resolve => {
    win.addEventListener("connected", resolve);
  });
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

  const dbg = createDebuggerContext(iframe);
  await waitForElement(dbg, ".tab");
  return iframe;
}

async function navigateToTab(dbg) {
  const tabs = dbg.launchpadStore.getState().tabs.get("tabs");
  const tabId = tabs
    .find(t => {
      return t.get("clientType") == "firefox";
    })
    .get("id");

  dbg.win.location = `/?firefox-tab=${tabId}`;
  return waitForElement(dbg, ".debugger");
}

async function navigate(dbg, url) {
  dbg.win.client.navigate(`${url}`);

  return Promise.race([
    waitForPaused(dbg),
    waitForTargetEvent(dbg, "navigate")
  ]);
}

async function initDebugger(url, ...sources) {
  const iframe = await createIframe();
  const dbg = createDebuggerContext(iframe);

  await navigateToTab(dbg);
  dbg = createDebuggerContext(iframe);

  const connected = waitForConnection(dbg.win);
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
