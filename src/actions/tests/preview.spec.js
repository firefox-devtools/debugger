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
      sourceContents: () => Promise.resolve("list"),
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
    await dispatch(actions.loadSourceText(I.Map({ id: fileName })));

    await dispatch(actions.selectLocation({ sourceId: fileName }));
    await dispatch(actions.setSymbols(fileName));
    await dispatch(
      actions.paused({
        why: { type: "resumeLimit" },
        frames: [
          { id: "frame1", location: { sourceId: fileName, line: 1, column: 1 } }
        ]
      })
    );
  }

  it("react instance", async () => {
    await setup(
      "foo.js",
      jest
        .fn()
        .mockImplementationOnce(() =>
          // result of evaluation setPreview
          Promise.resolve({
            result: react
          })
        )
        .mockImplementationOnce(() =>
          // result of evaluation in getPreview
          Promise.resolve({
            result: { preview: { items: ["Foo"] } }
          })
        )
    );

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
