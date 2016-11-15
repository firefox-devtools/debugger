const { KeyShortcuts } = require("./client/shared/key-shortcuts");
const { DebuggerTransport } = require("./transport/transport");
const { DebuggerClient } = require("./shared/client/main");
const PrefsHelper = require("./client/shared/prefs").PrefsHelper;
const { TargetFactory } = require("./client/framework/target");
const DevToolsUtils = require("./shared/DevToolsUtils");
const AppConstants = require("./sham/appconstants");
const EventEmitter = require("./shared/event-emitter");
const WebsocketTransport = require("./shared/transport/websocket-transport");
const Menu = require("./client/framework/menu");
const MenuItem = require("./client/framework/menu-item");
const Tree = require("./client/shared/components/tree");

module.exports = {
  KeyShortcuts,
  PrefsHelper,
  DebuggerClient,
  DebuggerTransport,
  TargetFactory,
  DevToolsUtils,
  AppConstants,
  EventEmitter,
  WebsocketTransport,
  Menu,
  MenuItem,
  Tree
};
