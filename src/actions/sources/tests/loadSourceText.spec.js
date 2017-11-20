import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../../utils/test-head";
const {
  getSource,
  getSources,
  getSelectedSource,
  getSourceTabs,
  getOutOfScopeLocations,
  getSelectedLocation
} = selectors;

import { sourceThreadClient as threadClient } from "../../tests/helpers/threadClient.js";

// import { loadSourceText, newSource } from "../../index";
// import { loadSourceText } from "../loadSourceText";

describe("loadSourceText", () => {
  it("f", async () => {
    let resolve;
    let count = 0;
    const { dispatch, getState } = createStore({
      sourceContents: () =>
        new Promise(r => {
          count++;
          resolve = r;
        })
    });
    let source = makeSource("foo", { loadedState: "unloaded" });

    await dispatch(actions.newSource(source));

    source = getSource(getState(), source.id).toJS();
    dispatch(actions.loadSourceText(source));

    source = getSource(getState(), source.id).toJS();
    dispatch(actions.loadSourceText(source));

    resolve({ source: "yay", contentType: "text/javascript" });
    expect(count).toEqual(1);
    expect(getSource(getState(), source.id).toJS().text).toEqual("yay");
  });
});
