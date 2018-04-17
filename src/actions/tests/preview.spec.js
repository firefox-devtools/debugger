/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../utils/test-head";
import I from "immutable";
import readFixture from "./helpers/readFixture";
import { prefs } from "../../utils/prefs";

const threadClient = {
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) =>
      resolve({
        source: sourceTexts[sourceId],
        contentType: "text/javascript"
      })
    );
  },
  setPausePoints: async () => {},
  getFrameScopes: async () => {},
  evaluateInFrame: function(expression, frameId) {
    return new Promise((resolve, reject) =>
      resolve({ result: evaluationResult[expression] })
    );
  },
  evaluateExpressions: function(expressions, frameId) {
    return new Promise((resolve, reject) =>
      resolve(
        expressions.map(expression => ({
          result: evaluationResult[expression]
        }))
      )
    );
  }
};

const sourceTexts = {
  "base.js": "function base(boo) {}",
  "foo.js": "function base(boo) { return this.bazz; } outOfScope",
  "immutable.js": "list",
  "scopes.js": readFixture("scopes.js"),
  "reactComponent.js": readFixture("reactComponent.js")
};

const react = {
  actor: "server1.conn34.child2/obj341",
  preview: {
    ownProperties: {
      _reactInternalInstance: {}
    }
  }
};

const immutableList = {
  actor: "server1.conn34.child2/obj341",
  preview: {
    ownProperties: {
      _root: {},
      __ownerID: {},
      __altered: {},
      __hash: {}
    }
  }
};

let evaluationResult;

describe("setPreview", () => {
  let dispatch = undefined;
  let getState = undefined;

  async function setup(fileName) {
    const store = createStore(threadClient);
    prefs.autoPrettyPrint = false;

    dispatch = store.dispatch;
    getState = store.getState;

    const source = makeSource(fileName);
    await dispatch(actions.newSource(source));
    await dispatch(actions.loadSourceText(I.Map({ id: fileName })));

    await dispatch(actions.selectLocation({ sourceId: fileName }));
    await dispatch(actions.setSymbols(fileName));
    await dispatch(
      actions.paused({
        why: { type: "resumeLimit" },
        frames: [{ id: "frame1", location: { sourceId: fileName } }]
      })
    );
  }

  it("react instance", async () => {
    await setup("foo.js");
    evaluationResult = {
      this: react
    };
    evaluationResult[
      "this.hasOwnProperty('_reactInternalFiber') ? " +
        "this._reactInternalFiber.type.name : " +
        "this._reactInternalInstance.getName()"
    ] =
      "Foo";

    await dispatch(
      actions.setPreview(
        "this",
        { start: { line: 1, column: 28 }, end: { line: 1, column: 32 } },
        { line: 1, column: 30 }
      )
    );
    const preview = selectors.getPreview(getState());
    expect(preview).toMatchSnapshot();
  });

  it("Immutable list", async () => {
    await setup("immutable.js");

    evaluationResult = {
      list: immutableList,
      "list.constructor.name": "Listless",
      "list.toJS()": { actor: "bazz", preview: {} }
    };

    await dispatch(
      actions.setPreview(
        "list",
        { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
        { line: 1, column: 4 }
      )
    );

    const preview = selectors.getPreview(getState());
    expect(preview).toMatchSnapshot();
  });
});
