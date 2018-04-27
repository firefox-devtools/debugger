/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import type { Store } from "../types";
const {
  WAIT_UNTIL_TYPE
} = require("../../shared/redux/middleware/waitUntilService");

/*
 * Takes an Enzyme wrapper (obtained with mount/shallow/…) and
 * returns a stringified version of the ObjectInspector, e.g.
 *
 *   ▼ Map { Symbol(a) → "value-a", Symbol(b) → "value-b" }
 *   |    size : 2
 *   |  ▼ <entries>
 *   |  |  ▼ 0 : Symbol(a) → "value-a"
 *   |  |  |    <key> : Symbol(a)
 *   |  |  |    <value> : "value-a"
 *   |  |  ▼ 1 : Symbol(b) → "value-b"
 *   |  |  |    <key> : Symbol(b)
 *   |  |  |    <value> : "value-b"
 *   |  ▼ <prototype> : Object { … }
 *
 */
function formatObjectInspector(wrapper: Object) {
  const hasFocusedNode = wrapper.find(".tree-node.focused").length > 0;
  const textTree = wrapper
    .find(".tree-node")
    .map(node => {
      const indentStr = "|  ".repeat((node.prop("aria-level") || 1) - 1);
      // Need to target img.arrow or Enzyme will also match the ArrowExpander
      // component.
      const arrow = node.find("img.arrow");
      let arrowStr = "  ";
      if (arrow.exists()) {
        arrowStr = arrow.hasClass("expanded") ? "▼ " : "▶︎ ";
      } else {
        arrowStr = "  ";
      }

      const icon = node
        .find(".node")
        .first()
        .hasClass("block")
        ? "☲ "
        : "";
      const text = `${indentStr}${arrowStr}${icon}${getSanitizedNodeText(
        node
      )}`;
      if (!hasFocusedNode) {
        return text;
      }
      return node.hasClass("focused") ? `[ ${text} ]` : `  ${text}`;
    })
    .join("\n");
  // Wrap the text representation in new lines so it keeps alignment between
  // tree nodes.
  return `\n${textTree}\n`;
}

function getSanitizedNodeText(node) {
  // Stripping off the invisible space used in the indent.
  return node.text().replace(/^\u200B+/, "");
}

/**
 * Wait for a specific action type to be dispatched.
 *
 * @param {Object} store: Redux store
 * @param {String} type: type of the actin to wait for
 * @return {Promise}
 */
function waitForDispatch(
  store: Object,
  type: string
): Promise<{ type: string }> {
  return new Promise(resolve => {
    store.dispatch({
      type: WAIT_UNTIL_TYPE,
      predicate: action => action.type === type,
      run: (dispatch, getState, action) => {
        resolve(action);
      }
    });
  });
}

/**
 * Wait until the condition evaluates to something truthy
 * @param {function} condition: function that we need for returning something
 *                              truthy.
 * @param {int} interval: Time to wait before trying to evaluate condition again
 * @param {int} maxTries: Number of evaluation to try.
 */
async function waitFor(
  condition: any => any,
  interval: number = 50,
  maxTries: number = 100
) {
  let res = condition();
  while (!res) {
    await new Promise(done => setTimeout(done, interval));
    maxTries--;

    if (maxTries <= 0) {
      throw new Error("waitFor - maxTries limit hit");
    }

    res = condition();
  }
  return res;
}

/**
 * Wait until the state has all the expected keys for the loadedProperties
 * state prop.
 * @param {Redux Store} store: function that we need for returning something
 *                             truthy.
 * @param {Array} expectedKeys: Array of stringified keys.
 * @param {int} interval: Time to wait before trying to evaluate condition again
 * @param {int} maxTries: Number of evaluation to try.
 */
function waitForLoadedProperties(
  store: Store,
  expectedKeys: Array<string>,
  interval: number,
  maxTries: number
): Promise<any> {
  return waitFor(
    () => storeHasLoadedPropertiesKeys(store, expectedKeys),
    interval,
    maxTries
  );
}

function storeHasLoadedPropertiesKeys(
  store: Store,
  expectedKeys: Array<string>
) {
  return expectedKeys.every(key => storeHasLoadedProperty(store, key));
}

function storeHasLoadedProperty(store: Store, key: string): boolean {
  return [...store.getState().loadedProperties.keys()].some(
    k => k.toString() === key
  );
}

function storeHasExactLoadedProperties(
  store: Store,
  expectedKeys: Array<string>
) {
  return (
    expectedKeys.length === store.getState().loadedProperties.size &&
    expectedKeys.every(key => storeHasLoadedProperty(store, key))
  );
}

function storeHasExpandedPaths(store: Store, expectedKeys: Array<string>) {
  return expectedKeys.every(key => storeHasExpandedPath(store, key));
}

function storeHasExpandedPath(store: Store, key: string): boolean {
  return [...store.getState().expandedPaths.keys()].some(
    k => k.toString() === key
  );
}

function storeHasExactExpandedPaths(store: Store, expectedKeys: Array<string>) {
  return (
    expectedKeys.length === store.getState().expandedPaths.size &&
    expectedKeys.every(key => storeHasExpandedPath(store, key))
  );
}

module.exports = {
  formatObjectInspector,
  storeHasExpandedPaths,
  storeHasExpandedPath,
  storeHasExactExpandedPaths,
  storeHasLoadedPropertiesKeys,
  storeHasLoadedProperty,
  storeHasExactLoadedProperties,
  waitFor,
  waitForDispatch,
  waitForLoadedProperties
};
