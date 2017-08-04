import { actions, selectors, createStore } from "../../utils/test-head";

const { isStepping } = selectors;

let stepInResolve = null;
const mockThreadClient = {
  stepIn: () =>
    new Promise(_resolve => {
      stepInResolve = _resolve;
    }),
  getFrameScopes: frame => frame.scope,
  sourceContents: sourceId => {
    return new Promise((resolve, reject) => {
      switch (sourceId) {
        case "foo1":
          resolve({
            source: "function foo1() {\n  return 5;\n}",
            contentType: "text/javascript"
          });
      }
    });
  }
};

describe("pause", () => {
  it("should set and clear the command", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);
    const mockPauseInfo = {
      frames: [{ id: 1, scope: [], location: { sourceId: "foo1", line: 4 } }],
      loadedObjects: [],
      why: {}
    };

    await dispatch(actions.paused(mockPauseInfo));
    dispatch(actions.stepIn());
    expect(isStepping(getState())).toBeTruthy();
    await stepInResolve();
    expect(isStepping(getState())).toBeFalsy();
  });

  it("should not evaluate expression while stepping", async () => {
    const client = { evaluate: jest.fn() };
    const { dispatch } = createStore(client);

    dispatch(actions.stepIn());
    await dispatch(actions.resumed());
    expect(client.evaluate.mock.calls.length).toEqual(0);
  });
});
