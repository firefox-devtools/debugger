import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../../utils/test-head";
const { getSource, getSources, getSelectedSource } = selectors;

// eslint-disable-next-line max-len
import { sourceThreadClient as threadClient } from "../../tests/helpers/threadClient.js";

describe("sources - new sources", () => {
  it(`should clear sourceMapURL on fail
        to load original source URLs`, async () => {
    const { dispatch, getState } = createStore(threadClient);
    // loadSourceMap is called upon creation of the source
    await dispatch(
      actions.newSource(makeSource("base.js", { sourceMapURL: "base.map.js" }))
    );
    const base = getSource(getState(), "base.js");
    expect(base.get("sourceMapURL")).toEqual("");
  });

  it("should add sources to state", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("jquery.js")));

    expect(getSources(getState()).size).toEqual(2);
    const base = getSource(getState(), "base.js");
    const jquery = getSource(getState(), "jquery.js");
    expect(base.get("id")).toEqual("base.js");
    expect(jquery.get("id")).toEqual("jquery.js");
  });

  it("should not add multiple identical sources", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("base.js")));

    expect(getSources(getState()).size).toEqual(1);
  });

  it("should automatically select a pending source", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const baseSource = makeSource("base.js");
    await dispatch(actions.selectSourceURL(baseSource.url));

    expect(getSelectedSource(getState())).toBe(undefined);
    await dispatch(actions.newSource(baseSource));
    expect(getSelectedSource(getState()).get("url")).toBe(baseSource.url);
  });
});
