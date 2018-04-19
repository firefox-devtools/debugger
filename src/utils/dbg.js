/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as timings from "./timings";
import { prefs, features } from "./prefs";
import { isDevelopment } from "devtools-config";
import { formatPausePoints } from "./pause/pausePoints";

function findSource(dbg: any, url: string) {
  const sources = dbg.selectors.getSources();
  const source = sources.find(s => (s.get("url") || "").includes(url));

  if (!source) {
    return;
  }

  return source.toJS();
}

function sendPacket(dbg: any, packet: any, callback: () => void) {
  dbg.client.sendPacket(packet, callback || console.log);
}

function sendPacketToThread(dbg: Object, packet: any, callback: () => void) {
  sendPacket(
    dbg,
    { to: dbg.connection.tabConnection.threadClient.actor, ...packet },
    callback
  );
}

function evaluate(dbg: Object, expression: any, callback: () => void) {
  dbg.client.evaluate(expression).then(callback || console.log);
}

function bindSelectors(obj: Object): Object {
  return Object.keys(obj.selectors).reduce((bound, selector) => {
    bound[selector] = (a, b, c) =>
      obj.selectors[selector](obj.store.getState(), a, b, c);
    return bound;
  }, {});
}

function getCM() {
  const cm: any = document.querySelector(".CodeMirror");
  return cm && cm.CodeMirror;
}

function _formatPausePoints(dbg: Object, url: string) {
  const source = dbg.helpers.findSource(url);
  const pausePoints = dbg.selectors.getPausePoints(source);
  console.log(formatPausePoints(source.text, pausePoints));
}

export function setupHelper(obj: Object) {
  const selectors = bindSelectors(obj);
  const dbg: Object = {
    ...obj,
    selectors,
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
