/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { LocalizationHelper } = require("devtools/shared/l10n");
const {
  gDevToolsBrowser
} = require("devtools/client/framework/devtools-browser");
loader.lazyRequireGetter(
  this,
  "openContentLink",
  "devtools/client/shared/link",
  true
);

const DBG_STRINGS_URI = "devtools/client/locales/debugger.properties";
const L10N = new LocalizationHelper(DBG_STRINGS_URI);

function DebuggerPanel(iframeWindow, toolbox) {
  this.panelWin = iframeWindow;
  this.panelWin.L10N = L10N;
  this.toolbox = toolbox;
}

DebuggerPanel.prototype = {
  open: async function() {
    const {
      actions,
      store,
      selectors,
      client
    } = await this.panelWin.Debugger.bootstrap({
      threadClient: this.toolbox.threadClient,
      tabTarget: this.toolbox.target,
      debuggerClient: this.toolbox.target.client,
      sourceMaps: this.toolbox.sourceMapService,
      panel: this
    });

    this._actions = actions;
    this._store = store;
    this._selectors = selectors;
    this._client = client;
    this.isReady = true;

    this.panelWin.document.addEventListener(
      "drag:start",
      this.toolbox.toggleDragging
    );
    this.panelWin.document.addEventListener(
      "drag:end",
      this.toolbox.toggleDragging
    );

    return this;
  },

  getVarsForTests() {
    return {
      store: this._store,
      selectors: this._selectors,
      actions: this._actions,
      client: this._client
    };
  },

  _getState: function() {
    return this._store.getState();
  },

  openLink: function(url) {
    openContentLink(url);
  },

  openWorkerToolbox: function(workerTargetFront) {
    return gDevToolsBrowser.openWorkerToolbox(workerTargetFront, "jsdebugger");
  },

  openConsoleAndEvaluate: async function(input) {
    const webconsolePanel = await this.toolbox.selectTool("webconsole");
    const jsterm = webconsolePanel.hud.jsterm;
    jsterm.execute(input);
  },

  openElementInInspector: async function(grip) {
    await this.toolbox.initInspector();
    const onSelectInspector = this.toolbox.selectTool("inspector");
    const onGripNodeToFront = this.toolbox.walker.gripToNodeFront(grip);
    const [front, inspector] = await Promise.all([
      onGripNodeToFront,
      onSelectInspector
    ]);

    const onInspectorUpdated = inspector.once("inspector-updated");
    const onNodeFrontSet = this.toolbox.selection.setNodeFront(front, {
      reason: "debugger"
    });

    return Promise.all([onNodeFrontSet, onInspectorUpdated]);
  },

  getFrames: function() {
    const thread = this._selectors.getCurrentThread(this._getState());
    const frames = this._selectors.getFrames(this._getState(), thread);

    // Frames is null when the debugger is not paused.
    if (!frames) {
      return {
        frames: [],
        selected: -1
      };
    }

    const selectedFrame = this._selectors.getSelectedFrame(
      this._getState(),
      thread
    );
    const selected = frames.findIndex(frame => frame.id == selectedFrame.id);

    frames.forEach(frame => {
      frame.actor = frame.id;
    });

    return { frames, selected };
  },

  getMappedExpression(expression) {
    return this._actions.getMappedExpression(expression);
  },

  isPaused() {
    const thread = this._selectors.getCurrentThread(this._getState());
    return this._selectors.getIsPaused(this._getState(), thread);
  },

  selectSourceURL(url, line) {
    return this._actions.selectSourceURL(url, { line });
  },

  selectSource(sourceId, line) {
    return this._actions.selectSource(sourceId, { line });
  },

  getSourceByActorId(sourceId) {
    return this._selectors.getSourceByActorId(this._getState(), sourceId);
  },

  getSourceByURL(sourceURL) {
    return this._selectors.getSourceByURL(this._getState(), sourceURL);
  },

  destroy: function() {
    this.panelWin.Debugger.destroy();
    this.emit("destroyed");
  }
};

exports.DebuggerPanel = DebuggerPanel;
