/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  actions,
  selectors,
  createStore,
  makeFrame,
  makeSource,
  waitForState
} from "../../../utils/test-head";
const {
  getSource,
  getSources,
  getSelectedSource,
  getSourceTabs,
  getSourceMetaData,
  getOutOfScopeLocations,
  getSelectedLocation
} = selectors;

import { sourceThreadClient } from "../../tests/helpers/threadClient.js";

process.on("unhandledRejection", (reason, p) => {});

describe("sources", () => {
  it("should select a source", async () => {
    // Note that we pass an empty client in because the action checks
    // if it exists.
    const store = createStore(sourceThreadClient);
    const { dispatch, getState } = store;

    await dispatch(actions.newSource(makeSource("foo1")));
    await dispatch(
      actions.paused({
        why: { type: "debuggerStatement" },
        frames: [makeFrame({ id: 1, sourceId: "foo1" })]
      })
    );

    await dispatch(
      actions.selectLocation({ sourceId: "foo1", line: 1, column: 5 })
    );

    const selectedSource = getSelectedSource(getState());
    expect(selectedSource.get("id")).toEqual("foo1");

    const source = getSource(getState(), selectedSource.get("id"));
    expect(source.id).toEqual("foo1");

    await waitForState(
      store,
      state =>
        getOutOfScopeLocations(state) && getSourceMetaData(state, source.id)
    );
    const locations = getOutOfScopeLocations(getState());
    expect(locations).toHaveLength(1);
  });

  it("should automatically select a pending source", async () => {
    const { dispatch, getState } = createStore(sourceThreadClient);
    const baseSource = makeSource("base.js");
    await dispatch(actions.selectSourceURL(baseSource.url));

    expect(getSelectedSource(getState())).toBe(undefined);
    await dispatch(actions.newSource(baseSource));
    expect(getSelectedSource(getState()).url).toBe(baseSource.url);
  });

  it("should open a tab for the source", async () => {
    const { dispatch, getState } = createStore(sourceThreadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    dispatch(actions.selectLocation({ sourceId: "foo.js" }));

    const tabs = getSourceTabs(getState());
    expect(tabs.size).toEqual(1);
    expect(tabs.get(0)).toEqual("http://localhost:8000/examples/foo.js");
  });

  it("should select previous tab on tab closed", async () => {
    const { dispatch, getState } = createStore(sourceThreadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("baz.js")));
    dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    dispatch(actions.selectLocation({ sourceId: "baz.js" }));
    dispatch(actions.closeTab("http://localhost:8000/examples/baz.js"));
    expect(getSelectedSource(getState()).get("id")).toBe("bar.js");
    expect(getSourceTabs(getState()).size).toBe(2);
  });

  it("should select next tab on tab closed if no previous tab", async () => {
    const { dispatch, getState } = createStore(sourceThreadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("baz.js")));
    dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    dispatch(actions.selectLocation({ sourceId: "baz.js" }));
    dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    dispatch(actions.closeTab("http://localhost:8000/examples/foo.js"));
    expect(getSelectedSource(getState()).get("id")).toBe("bar.js");
    expect(getSourceTabs(getState()).size).toBe(2);
  });

  it("should not select new sources that lack a URL", async () => {
    const { dispatch, getState } = createStore(sourceThreadClient);
    await dispatch(actions.newSource({ id: "foo" }));

    expect(getSources(getState()).size).toEqual(1);
    const selectedLocation = getSelectedLocation(getState());
    expect(selectedLocation).toEqual(undefined);
  });
});
