/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../utils/test-head";
import readFixture from "./helpers/readFixture";
import { prefs } from "../../utils/prefs";

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

describe("setPreview", () => {
  let dispatch = undefined;
  let getState = undefined;

  async function setup(fileName, evaluateInFrame) {
    const threadClient = {
      sourceContents: id => Promise.resolve({ source: readFixture(id) }),
      setPausePoints: async () => {},
      getFrameScopes: async () => {},
      evaluateExpressions: async () => {},
      evaluateInFrame
    };
    const store = createStore(threadClient);
    prefs.autoPrettyPrint = false;

    dispatch = store.dispatch;
    getState = store.getState;

    const source = makeSource(fileName);
    await dispatch(actions.newSource(source));
    await dispatch(actions.loadSourceText({ id: fileName }));

    await dispatch(actions.selectLocation({ sourceId: fileName }));
    await dispatch(actions.setSymbols(fileName));
    await dispatch(
      actions.paused({
        why: { type: "resumeLimit" },
        frames: [
          { id: "frame1", location: { sourceId: fileName, line: 5, column: 1 } }
        ]
      })
    );
  }

  it("react instance", async () => {
    const componentNames = { preview: { items: ["Foo"] } };

    await setup("reactComponent.js", expression =>
      Promise.resolve({
        result: expression.match(/_reactInternalFiber/) ? componentNames : react
      })
    );

    await dispatch(
      actions.setPreview(
        "this",
        { start: { line: 5, column: 12 }, end: { line: 5, column: 18 } },
        { line: 5, column: 12 }
      )
    );
    const preview = selectors.getPreview(getState());
    expect(preview).toMatchSnapshot();
  });

  it("Immutable list", async () => {
    await setup("immutable.js", expression =>
      Promise.resolve({
        result: {
          list: immutableList,
          "list.constructor.name": "Listless",
          "list.toJS()": { actor: "bazz", preview: {} }
        }[expression]
      })
    );

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
