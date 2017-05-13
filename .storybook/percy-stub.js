const mock = require("mock-require");

mock("../src/utils/prefs", {
  prefs: {
    clientSourceMapsEnabled: true,
    pauseOnExceptions: false,
    ignoreCaughtExceptions: false,
    callStackVisible: true,
    scopesVisible: true,
    startPanelCollapsed: false,
    endPanelCollapsed: false,
    tabs: [],
    pendingSelectedLocation: {},
    pendingBreakpoints: [],
    expressions: []
  }
});
mock("devtools-utils/src/network-request", () => {});

function WorkerDispatcher() {}
WorkerDispatcher.prototype = {};
WorkerDispatcher.prototype.task = () => {};
WorkerDispatcher.prototype.start = () => {};
WorkerDispatcher.prototype.stop = () => {};

mock("devtools-utils/src/worker-utils", {
  WorkerDispatcher
});

mock("devtools-source-map");
mock("devtools-launchpad");
mock("devtools-source-editor", {
  SourceEditorUtils: {}
});
mock("devtools-modules", {
  Services: { appinfo: {} },
  keyShortcuts: {}
});
