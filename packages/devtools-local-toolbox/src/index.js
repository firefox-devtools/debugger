/* global window, document, DebuggerConfig */

const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");

const { DevToolsUtils, AppConstants } = require("devtools-sham-modules");
const { injectGlobals, debugGlobal } = require("./utils/debug");
const { setConfig, isEnabled, getValue, isDevelopment } = require("devtools-config");
const L10N = require("./utils/L10N");

setConfig(DebuggerConfig);

// Set various flags before requiring app code.
if (isEnabled("logging.client")) {
  DevToolsUtils.dumpn.wantLogging = true;
}

const client = require("./clients");
const { getClient, firefox, chrome, startDebugging } = client;

const Root = require("./components/Root");

// Using this static variable allows webpack to know at compile-time
// to avoid this require and not include it at all in the output.
if (process.env.TARGET !== "firefox-panel") {
  const theme = getValue("theme");
  switch (theme) {
    case "dark": require("./lib/themes/dark-theme.css"); break;
    case "light": require("./lib/themes/light-theme.css"); break;
    case "firebug": require("./lib/themes/firebug-theme.css"); break;
  }
  document.body.parentNode.classList.add(`theme-${theme}`);
}

function initApp() {
  const configureStore = require("./utils/create-store");
  const reducers = require("./reducers");
  const LandingPage = require("./components/LandingPage");

  const createStore = configureStore({
    log: getValue("logging.actions"),
    makeThunkArgs: (args, state) => {
      return Object.assign({}, args, { client: getClient(state) });
    }
  });

  const store = createStore(combineReducers(reducers));
  const actions = bindActionCreators(require("./actions"), store.dispatch);

  if (isDevelopment()) {
    AppConstants.DEBUG_JS_MODULES = true;
    injectGlobals({ store });
  }

  return { store, actions, LandingPage };
}

function renderRoot(_React, _ReactDOM, component, _store) {
  const { createElement } = _React;
  const mount = document.querySelector("#mount");

  // bail in test environments that do not have a mount
  if (!mount) {
    return;
  }

  const root = Root();
  mount.appendChild(root);

  if (component.props || component.propTypes) {
    _ReactDOM.render(
      createElement(Provider, { store: _store }, createElement(component)),
      root
    );
  } else {
    root.appendChild(component);
  }
}

function getTargetFromQuery() {
  const href = window.location.href;
  const nodeMatch = href.match(/ws=([^&#]*)/);
  const firefoxMatch = href.match(/firefox-tab=([^&#]*)/);
  const chromeMatch = href.match(/chrome-tab=([^&#]*)/);

  if (nodeMatch) {
    return { type: "node", param: nodeMatch[1] };
  } else if (firefoxMatch) {
    return { type: "firefox", param: firefoxMatch[1] };
  } else if (chromeMatch) {
    return { type: "chrome", param: chromeMatch[1] };
  }

  return null;
}

function bootstrap(React, ReactDOM, App, appActions, appStore) {
  const connTarget = getTargetFromQuery();
  if (connTarget) {
    return startDebugging(connTarget, appActions)
      .then(({ tabs, client }) => {
        renderRoot(React, ReactDOM, App, appStore);
        return { connTarget, client };
      });
  } else {
    const { store, actions, LandingPage } = initApp();
    renderRoot(React, ReactDOM, LandingPage, store);
    chrome.connectClient().then(tabs => {
      actions.newTabs(tabs);
    }).catch(e => {
      console.log("Connect to chrome:");
      console.log("https://github.com/devtools-html/debugger.html/blob/master/CONTRIBUTING.md#chrome");
    });
    return firefox.connectClient().then(tabs => {
      actions.newTabs(tabs);
    });
  }
}

module.exports = {
  bootstrap,
  renderRoot,
  debugGlobal,
  client,
  L10N
};
