/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../utils/test-head";
const { getSelectedSource, getSourceTabs } = selectors;

import { sourceThreadClient as threadClient } from "./helpers/threadClient.js";

describe("closing tabs", () => {
  it("closing a tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getSourceTabs(getState()).size).toBe(0);
  });

  it("closing the inactive tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState()).id).toBe("bar.js");
    expect(getSourceTabs(getState()).size).toBe(1);
  });

  it("closing the only tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getSourceTabs(getState()).size).toBe(0);
  });

  it("closing the active tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    dispatch(actions.closeTab("http://localhost:8000/examples/bar.js"));

    expect(getSelectedSource(getState()).get("id")).toBe("foo.js");
    expect(getSourceTabs(getState()).size).toBe(1);
  });

  it("closing many inactive tabs", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("bazz.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bazz.js" }));
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/foo.js",
        "http://localhost:8000/examples/bar.js"
      ])
    );

    expect(getSelectedSource(getState()).get("id")).toBe("bazz.js");
    expect(getSourceTabs(getState()).size).toBe(1);
  });

  it("closing many tabs including the active tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("bazz.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bazz.js" }));
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/bar.js",
        "http://localhost:8000/examples/bazz.js"
      ])
    );

    expect(getSelectedSource(getState()).get("id")).toBe("foo.js");
    expect(getSourceTabs(getState()).size).toBe(1);
  });

  it("closing all the tabs", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    dispatch(
      actions.closeTabs([
        "http://localhost:8000/examples/foo.js",
        "http://localhost:8000/examples/bar.js"
      ])
    );

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getSourceTabs(getState()).size).toBe(0);
  });
});
