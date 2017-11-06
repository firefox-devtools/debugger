import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../utils/test-head";

const { isStepping } = selectors;

let stepInResolve = null;
const mockThreadClient = {
  stepIn: () =>
    new Promise(_resolve => {
      stepInResolve = _resolve;
    }),
  evaluate: () => new Promise(_resolve => {}),
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

function createPauseInfo(overrides = {}) {
  return {
    frames: [{ id: 1, scope: [], location: { sourceId: "foo1", line: 4 } }],
    loadedObjects: [],
    why: {},
    ...overrides
  };
}

describe("pause", () => {
  describe("stepping", () => {
    it("should set and clear the command", async () => {
      const { dispatch, getState } = createStore(mockThreadClient);
      const mockPauseInfo = createPauseInfo();

      await dispatch(actions.newSource(makeSource("foo1")));
      await dispatch(actions.paused(mockPauseInfo));
      const stepped = dispatch(actions.stepIn());
      expect(isStepping(getState())).toBeTruthy();
      await stepInResolve();
      await stepped;
      expect(isStepping(getState())).toBeFalsy();
    });
  });

  describe("resumed", () => {
    it("should not evaluate expression while stepping", async () => {
      const client = { evaluate: jest.fn() };
      const { dispatch } = createStore(client);

      dispatch(actions.stepIn());
      await dispatch(actions.resumed());
      expect(client.evaluate.mock.calls.length).toEqual(0);
    });

    it("resuming - will re-evaluate watch expressions", async () => {
      const store = createStore(mockThreadClient);
      const { dispatch } = store;
      const mockPauseInfo = createPauseInfo();

      await dispatch(actions.newSource(makeSource("foo1")));
      await dispatch(actions.addExpression("foo"));

      mockThreadClient.evaluate = () => new Promise(r => r("YAY"));
      await dispatch(actions.paused(mockPauseInfo));

      await dispatch(actions.resumed());
      expect(selectors.getExpression(store.getState(), "foo").value).toEqual(
        "YAY"
      );
    });
  });
});
