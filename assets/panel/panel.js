/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { Task } = require("devtools/shared/task");
var { LocalizationHelper } = require("devtools/shared/l10n");

const DBG_STRINGS_URI = "devtools/client/locales/debugger.properties";
var L10N = new LocalizationHelper(DBG_STRINGS_URI);

function DebuggerPanel(iframeWindow, toolbox) {
  this.panelWin = iframeWindow;
  this.panelWin.L10N = L10N;
  this.toolbox = toolbox;
}

DebuggerPanel.prototype = {
  open: async function () {
    if (!this.toolbox.target.isRemote) {
      await this.toolbox.target.makeRemote();
    }

    const {
      actions,
      store,
      selectors,
      client,
    } = await this.panelWin.Debugger.bootstrap({
      threadClient: this.toolbox.threadClient,
      tabTarget: this.toolbox.target,
      debuggerClient: this.toolbox.target._client,
      sourceMaps: this.toolbox.sourceMapService,
    });

    this._actions = actions;
    this._store = store;
    this._selectors = selectors;
    this._client = client;
    this.isReady = true;
    return this;
  },

  getVarsForTests () {
    return {
      store: this._store,
      selectors: this._selectors,
      actions: this._actions,
      client: this._client,
    };
  },

  _getState: function () {
    return this._store.getState();
  },

  getFrames: function () {
    let frames = this._selectors.getFrames(this._getState());

    // Frames is null when the debugger is not paused.
    if (!frames) {
      return {
        frames: [],
        selected: -1,
      };
    }

    frames = frames.toJS();
    const selectedFrame = this._selectors.getSelectedFrame(this._getState());
    const selected = frames.findIndex(frame => frame.id == selectedFrame.id);

    frames.forEach(frame => {
      frame.actor = frame.id;
    });

    return { frames, selected };
  },

  destroy: function () {
    this.panelWin.Debugger.destroy();
    this.emit("destroyed");
  },
};

exports.DebuggerPanel = DebuggerPanel;
