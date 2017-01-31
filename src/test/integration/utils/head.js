const mapValues = require("lodash/mapValues");
const injectDebuggee = require("./debuggee");
const {waitForTime} = require("./wait");
const {navigate} = require("./commands");
const {createDebuggerContext} = require("./shared");

async function createIframe() {
  let container = window["app-container"];
  let iframe = document.createElement("iframe");
  iframe.src = "http://localhost:8000";
  let id = document.createAttribute("id");
  id.value = "debuggerWindow";
  container.innerHTML = "";
  container.appendChild(iframe);
  await waitForTime(4000);

  return iframe;
}

async function navigateToTab(dbg) {
  const tabs = dbg.win.launchpadStore.getState().tabs.get("tabs");
  const tabId = tabs.find(t => {
    return t.get("clientType") == "firefox";
  }).get("id");

  dbg.win.location = `/?firefox-tab=${tabId}`;
  await waitForTime(4000);
}

async function initDebugger(url) {
  const iframe = await createIframe();
  let dbg = createDebuggerContext(iframe);
  await navigateToTab(dbg)

  dbg = createDebuggerContext(iframe);

  url = `http://localhost:8000/examples/${url}`
  await navigate(dbg, url);

  return createDebuggerContext(iframe);
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

module.exports = {
  initDebugger
};
