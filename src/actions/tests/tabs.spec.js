import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../utils/test-head";
const { getSelectedSource, getTabs, getSelectedTab } = selectors;

import { sourceThreadClient as threadClient } from "./helpers/threadClient.js";

describe("adding tabs", () => {});

describe("selecting tabs", () => {});

describe("closing tabs", () => {
  it("closing a tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));

    await dispatch(actions.closeTab("foo.js"));

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getTabs(getState()).size).toBe(0);
  });

  it("closing the inactive tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));

    await dispatch(actions.closeTab("foo.js"));

    expect(getSelectedSource(getState()).get("id")).toBe("bar.js");
    expect(getTabs(getState()).size).toBe(1);
  });

  it("closing the only tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));

    await dispatch(actions.closeTab("foo.js"));

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getTabs(getState()).size).toBe(1);
  });

  it("closing the active tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));

    await dispatch(actions.closeTab("bar.js"));

    expect(getSelectedSource(getState()).get("id")).toBe("foo.js");
    expect(getTabs(getState()).size).toBe(1);
  });

  it("closing many inactive tabs", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("bazz.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bazz.js" }));

    await dispatch(actions.closeTabs(["foo.js", "bar.js"]));

    expect(getSelectedSource(getState()).get("id")).toBe("bazz.js");
    expect(getTabs(getState()).size).toBe(1);
  });

  it("closing many tabs including the active tab", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.newSource(makeSource("bazz.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bazz.js" }));

    await dispatch(actions.closeTabs(["bar.js", "bazz.js"]));

    expect(getSelectedSource(getState()).get("id")).toBe("foo.js");
    expect(getTabs(getState()).size).toBe(1);
  });

  it("closing all the tabs", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("foo.js")));
    await dispatch(actions.newSource(makeSource("bar.js")));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.selectLocation({ sourceId: "bar.js" }));

    await dispatch(actions.closeTabs(["foo.js", "bar.js"]));

    expect(getSelectedSource(getState())).toBe(undefined);
    expect(getTabs(getState()).size).toBe(0);
  });
});
