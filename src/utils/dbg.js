import { bindActionCreators } from "redux";
import * as timings from "./timings";
import { prefs, features } from "./prefs";
import { isDevelopment } from "devtools-config";
import { formatPausePoints } from "./pause/pausePoints";

function findSource(dbg, url) {
  const sources = dbg.selectors.getSources();
  const source = sources.find(s => (s.get("url") || "").includes(url));

  if (!source) {
    return;
  }

  return source.toJS();
}

function sendPacket(dbg, packet, callback) {
  dbg.client.sendPacket(packet, callback || console.log);
  // dbg.connection.tabConnection.debuggerClient
  //   .request(packet)
  //   .then(callback || console.log);
}

function sendPacketToThread(dbg, packet, callback) {
  sendPacket(
    dbg,
    { to: dbg.connection.tabConnection.threadClient.actor, ...packet },
    callback
  );
}

function evaluate(dbg, expression, callback) {
  dbg.client.evaluate(expression).then(callback || console.log);
}

function bindSelectors(obj) {
  return Object.keys(obj.selectors).reduce((bound, selector) => {
    bound[selector] = (a, b, c) =>
      obj.selectors[selector](obj.store.getState(), a, b, c);
    return bound;
  }, {});
}

function getCM() {
  const cm = document.querySelector(".CodeMirror");
  return cm && cm.CodeMirror;
}

function _formatPausePoints(dbg, url) {
  const source = dbg.helpers.findSource(url);
  const pausePoints = dbg.selectors.getPausePoints(source);
  console.log(formatPausePoints(source.text, pausePoints));
}

export function setupHelper(obj) {
  const selectors = bindSelectors(obj);
  const actions = bindActionCreators(obj.actions, obj.store.dispatch);
  const dbg = {
    ...obj,
    selectors,
    actions,
    prefs,
    features,
    timings,
    getCM,
    helpers: {
      findSource: url => findSource(dbg, url),
      evaluate: (expression, cbk) => evaluate(dbg, expression, cbk),
      sendPacketToThread: (packet, cbk) => sendPacketToThread(dbg, packet, cbk),
      sendPacket: (packet, cbk) => sendPacket(dbg, packet, cbk)
    },
    formatters: {
      pausePoints: url => _formatPausePoints(dbg, url)
    }
  };

  window.dbg = dbg;

  if (isDevelopment()) {
    console.group("Development Notes");
    const baseUrl = "https://devtools-html.github.io/debugger.html";
    const localDevelopmentUrl = `${baseUrl}/docs/dbg.html`;
    console.log("Debugging Tips", localDevelopmentUrl);
    console.log("dbg", window.dbg);
    console.groupEnd();
  }
}
