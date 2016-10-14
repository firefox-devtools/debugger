const { KeyShortcuts } = require("./client/shared/key-shortcuts");
const { DebuggerTransport } = require("./transport/transport");
const {DebuggerClient} = require("./shared/client/main");
const PrefsHelper = require("./client/shared/prefs");
const {TargetFactory} = require("./client/framework/target")
const DevToolsUtils = require("./shared/DevToolsUtils")
const AppConstants = require("./sham/appconstants");
const EventEmitter = require("./shared/event-emitter");
const WebsocketTransport = require("./shared/transport/websocket-transport");

module.exports = {
  KeyShortcuts,
  PrefsHelper,
  DebuggerClient,
  DebuggerTransport,
  TargetFactory,
  DevToolsUtils,
  AppConstants,
  EventEmitter,
  WebsocketTransport
}
