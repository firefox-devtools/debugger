import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../../utils/test-head";
const { getSource } = selectors;

describe("loadSourceText", async () => {
  it("loads two sources w/ one request", async () => {
    let resolve;
    let count = 0;
    const { dispatch, getState } = createStore({
      sourceContents: () =>
        new Promise(r => {
          count++;
          resolve = r;
        })
    });
    const id = "foo";
    let source = makeSource(id, { loadedState: "unloaded" });

    await dispatch(actions.newSource(source));

    source = getSource(getState(), id);
    dispatch(actions.loadSourceText(source));

    source = getSource(getState(), id);
    const loading = dispatch(actions.loadSourceText(source));

    resolve({ source: "yay", contentType: "text/javascript" });
    await loading;
    expect(count).toEqual(1);
    expect(getSource(getState(), id).get("text")).toEqual("yay");
  });

  it("doesn't re-load loaded sources", async () => {
    let resolve;
    let count = 0;
    const { dispatch, getState } = createStore({
      sourceContents: () =>
        new Promise(r => {
          count++;
          resolve = r;
        })
    });
    const id = "foo";
    let source = makeSource(id, { loadedState: "unloaded" });

    await dispatch(actions.newSource(source));
    source = getSource(getState(), id);
    const loading = dispatch(actions.loadSourceText(source));
    resolve({ source: "yay", contentType: "text/javascript" });
    await loading;

    source = getSource(getState(), id);
    await dispatch(actions.loadSourceText(source));
    expect(count).toEqual(1);
    expect(getSource(getState(), id).get("text")).toEqual("yay");
  });
});
