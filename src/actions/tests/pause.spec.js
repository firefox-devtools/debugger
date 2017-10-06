import {
  actions,
  selectors,
  createStore,
  getHistory
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

      await dispatch(actions.paused(mockPauseInfo));
      dispatch(actions.stepIn());
      expect(isStepping(getState())).toBeTruthy();
      await stepInResolve();
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

    it("resuming", async () => {
      const { dispatch } = createStore(mockThreadClient);
      const mockPauseInfo = createPauseInfo();

      await dispatch(actions.paused(mockPauseInfo));
      await dispatch(actions.resumed());

      expect(getHistory("RESUME").length).toEqual(1);
    });

    it("resuming when not paused", async () => {
      const { dispatch } = createStore(mockThreadClient);
      await dispatch(actions.resumed());
      expect(getHistory("RESUME").length).toEqual(0);
    });
  });
});
