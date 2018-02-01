import { bindActionCreators } from "redux";
import * as timings from "./timings";
import { prefs, features } from "./prefs";

function findSource(dbg, url) {
  const sources = dbg.selectors.getSources();
  const source = sources.find(s => (s.get("url") || "").includes(url));

  if (!source) {
    return;
  }

  return source.toJS();
}

function sendPacket(dbg, packet, cbk) {
  dbg.connection.tabConnection.debuggerClient
    .request(packet)
    .then(cbk || console.log);
}

function evaluate(dbg, expression, cbk) {
  dbg.client.evaluate(expression).then(cbk || console.log);
}

function bindSelectors(obj) {
  return Object.keys(obj.selectors).reduce((bound, selector) => {
    bound[selector] = (a, b, c) =>
      obj.selectors[selector](obj.store.getState(), a, b, c);
    return bound;
  }, {});
}

export function setupHelper(obj) {
  const selectors = bindSelectors(obj);
  const actions = bindActionCreators(obj.actions, obj.store.dispatch);
  window.dbg = {
    ...obj,
    selectors,
    actions,
    prefs,
    features,
    timings,
    helpers: {
      findSource: url => findSource(dbg, url),
      evaluate: (expression, cbk) => evaluate(dbg, expression, cbk),
      sendPacket: (packet, cbk) => sendPacket(dbg, packet, cbk)
    }
  };

  console.group("Development Notes");
  const baseUrl = "https://devtools-html.github.io/debugger.html";
  const localDevelopmentUrl = `${baseUrl}/docs/dbg.html`;
  console.log("Debugging Tips", localDevelopmentUrl);
  console.log("dbg", window.dbg);
  console.groupEnd();
}
