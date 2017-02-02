const mapValues = require("lodash/mapValues");
const injectDebuggee = require("./debuggee");

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
  return dbg.client.debuggeeCommand(`${fnc}()`);
}

function createDebuggerContext(iframe) {
  const win = iframe.contentWindow.window;

  const globals = win.getGlobalsForTesting();
  const { debuggerStore: store, selectors } = globals;

  selectors = mapValues(globals.selectors, (selector) => {
    return function() {
      return selector(store.getState(), ...arguments);
    };
  });

  return {
    actions: globals.actions,
    selectors: globals.selectors,
    getState: store.getState,
    store,
    client: win.client,
    threadClient: globals.threadClient,
    win: win,
    launchpadStore: globals.launchpadStore
  }
}

async function createIframe() {
  let container = window["app-container"];
  let iframe = document.createElement("iframe");
  iframe.src = "http://localhost:8000";
  let id = document.createAttribute("id");
  id.value = "debuggerWindow";
  container.innerHTML = "";
  container.appendChild(iframe);

  await waitForTime(2000);
  return iframe;
}

async function navigateToTab(dbg) {
  const tabs = dbg.launchpadStore.getState().tabs.get("tabs");
  const tabId = tabs.find(t => {
    return t.get("clientType") == "firefox";
  }).get("id");

  dbg.win.location = `/?firefox-tab=${tabId}`;
  await waitForTime(3000);
}

async function navigate(dbg, url) {
  dbg.win.client.navigate(`${url}`);
  return waitForTime(3000);
}

async function initDebugger(url) {
  const iframe = await createIframe();
  const dbg = createDebuggerContext(iframe);

  await navigateToTab(dbg);
  dbg = createDebuggerContext(iframe);


  await navigate(
    dbg,
    `http://localhost:8000/integration/examples/${url}`
  );
  dbg = createDebuggerContext(iframe);

  return dbg;
}

function setupTestRunner() {

}



function info(msg) {
  console.log(`info: ${msg}\n`);
}

module.exports = {
  invokeInTab,
  initDebugger,
  setupTestRunner,
  info
}
