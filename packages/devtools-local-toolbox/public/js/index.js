/* global window, document, DebuggerConfig */

const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");
const ReactDOM = require("react-dom");
const React = require("react");

const {DevToolsUtils, AppConstants} = require("devtools-sham-modules");
const { injectGlobals, debugGlobal } = require("./utils/debug");
const { setConfig, isEnabled, getValue, isDevelopment } = require("devtools-config");

setConfig(DebuggerConfig);

// Set various flags before requiring app code.
if (isEnabled("logging.client")) {
  DevToolsUtils.dumpn.wantLogging = true;
}

const client = require("./clients");
const { getClient, connectClients, startDebugging } = client;

const Root = require("./components/Root");

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
  const mount = document.querySelector("#mount");

  // bail in test environments that do not have a mount
  if (!mount) {
    return;
  }

  _ReactDOM.render(
    _React.createElement(
      Provider,
      { store: _store },
      Root(component)
    ),
    mount
  );
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
    startDebugging(connTarget, appActions).then((tabs) => {
      renderRoot(React, ReactDOM, App, appStore);
    });
  } else {
    const { store, actions, LandingPage } = initApp();
    renderRoot(React, ReactDOM, LandingPage, store);
    connectClients(tabs => actions.newTabs(tabs));
  }
}

module.exports = {
  bootstrap,
  renderRoot,
  debugGlobal,
  client
};
