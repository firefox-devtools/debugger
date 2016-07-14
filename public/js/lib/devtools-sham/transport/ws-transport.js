/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const EventEmitter = require("devtools-sham/shared/event-emitter");

function WebSocketDebuggerTransport(socket) {
  EventEmitter.decorate(this);

  this._ws = socket;

  this.active = false;
  this.hooks = null;
}

WebSocketDebuggerTransport.prototype = {
  ready() {
    if (!this.active) {
      this.active = true;
      this._ws.onmessage = this._onMessage.bind(this);
    }
  },

  send(object) {
    this.emit("send", object);
    this._ws.send(JSON.stringify(object));
  },

  _onMessage(event) {
    let object = JSON.parse(event.data);
    this.emit("onPacket", object);
    if (this.hooks) {
      this.hooks.onPacket(object);
    }
  },

  close(reason) {
    this.emit("onClosed", reason);

    this.active = false;
    this._ws.close();
    if (this.hooks) {
      this.hooks.onClosed(reason);
      this.hooks = null;
    }
  },
};

module.exports = WebSocketDebuggerTransport;
