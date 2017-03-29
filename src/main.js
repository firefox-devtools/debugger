// @flow

const React = require("react");
const ReactDOM = require("react-dom");

const {
  bootstrap,
  L10N,
  unmountRoot,
} = require("devtools-launchpad");
const { isFirefoxPanel } = require("devtools-config");

const { onConnect } = require("./client");

if (!isFirefoxPanel()) {
  window.L10N = L10N;
  // $FlowIgnore:
  window.L10N.setBundle(require("../assets/panel/debugger.properties"));
}

if (isFirefoxPanel()) {
  const sourceMap = require("devtools-source-map");
  const prettyPrint = require("./utils/pretty-print");

  module.exports = {
    bootstrap: ({ threadClient, tabTarget, debuggerClient }: any) => {
      return onConnect({
        tab: { clientType: "firefox" },
        tabConnection: { tabTarget, threadClient, debuggerClient },
      });
    },
    destroy: () => {
      unmountRoot(ReactDOM);
      sourceMap.destroyWorker();
      prettyPrint.destroyWorker();
    },
  };
} else {
  bootstrap(React, ReactDOM).then(onConnect);
}
