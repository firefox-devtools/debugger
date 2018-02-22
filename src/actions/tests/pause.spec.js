import {
  actions,
  selectors,
  createStore,
  waitForState,
  makeSource,
  makeFrame
} from "../../utils/test-head";

import * as parser from "../../workers/parser/index";
import * as I from "immutable";

const { isStepping } = selectors;

let stepInResolve = null;
const mockThreadClient = {
  stepIn: () =>
    new Promise(_resolve => {
      stepInResolve = _resolve;
    }),
  stepOver: () => new Promise(_resolve => _resolve),
  evaluate: () => new Promise(_resolve => {}),
  getFrameScopes: async frame => frame.scope,
  setBreakpoint: () => new Promise(_resolve => {}),
  sourceContents: sourceId => {
    return new Promise((resolve, reject) => {
      switch (sourceId) {
        case "foo1":
          return resolve({
            source: "function foo1() {\n  return 5;\n}",
            contentType: "text/javascript"
          });
        case "await":
          return resolve({
            source: "async function aWait() {\n await foo();  return 5;\n}",
            contentType: "text/javascript"
          });

        case "foo":
          return resolve({
            source: "function foo() {\n  return -5;\n}",
            contentType: "text/javascript"
          });
      }
    });
  }
};

function createPauseInfo(frameLocation = { sourceId: "foo1", line: 2 }) {
  return {
    frames: [
      makeFrame(
        { id: 1, sourceId: frameLocation.sourceId },
        {
          location: frameLocation
        }
      )
    ],
    loadedObjects: [],
    why: {}
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

    it("should only step when paused", async () => {
      const client = { stepIn: jest.fn() };
      const { dispatch } = createStore(client);

      dispatch(actions.stepIn());
      expect(client.stepIn.mock.calls).toHaveLength(0);
    });

    it("should step when paused", async () => {
      const { dispatch, getState } = createStore(mockThreadClient);
      const mockPauseInfo = createPauseInfo();

      await dispatch(actions.newSource(makeSource("foo1")));
      await dispatch(actions.paused(mockPauseInfo));
      dispatch(actions.stepIn());
      expect(isStepping(getState())).toBeTruthy();
    });

    it("should step over when paused", async () => {
      const store = createStore(mockThreadClient);
      const { dispatch, getState } = store;
      const mockPauseInfo = createPauseInfo();

      await dispatch(actions.newSource(makeSource("foo1")));
      await dispatch(actions.paused(mockPauseInfo));
      const getNextStepSpy = jest.spyOn(parser, "getNextStep");
      dispatch(actions.stepOver());
      expect(getNextStepSpy).not.toBeCalled();
      expect(isStepping(getState())).toBeTruthy();
    });

    it("should step over when paused before an await", async () => {
      const store = createStore(mockThreadClient);
      const { dispatch } = store;
      const mockPauseInfo = createPauseInfo({
        sourceId: "await",
        line: 2,
        column: 0
      });

      await dispatch(actions.newSource(makeSource("await")));
      await dispatch(actions.loadSourceText(I.Map({ id: "await" })));

      await dispatch(actions.paused(mockPauseInfo));
      const getNextStepSpy = jest.spyOn(parser, "getNextStep");
      dispatch(actions.stepOver());
      expect(getNextStepSpy).toBeCalled();
      getNextStepSpy.mockRestore();
    });

    it("should step over when paused after an await", async () => {
      const store = createStore(mockThreadClient);
      const { dispatch } = store;
      const mockPauseInfo = createPauseInfo({
        sourceId: "await",
        line: 2,
        column: 6
      });

      await dispatch(actions.newSource(makeSource("await")));
      await dispatch(actions.loadSourceText(I.Map({ id: "await" })));

      await dispatch(actions.paused(mockPauseInfo));
      const getNextStepSpy = jest.spyOn(parser, "getNextStep");
      dispatch(actions.stepOver());
      expect(getNextStepSpy).toBeCalled();
      getNextStepSpy.mockRestore();
    });
  });

  describe("resumed", () => {
    it("should not evaluate expression while stepping", async () => {
      const client = { evaluate: jest.fn() };
      const { dispatch } = createStore(client);

      dispatch(actions.stepIn());
      await dispatch(actions.resumed());
      expect(client.evaluate.mock.calls).toHaveLength(0);
    });

    it("resuming - will re-evaluate watch expressions", async () => {
      const store = createStore(mockThreadClient);
      const { dispatch, getState } = store;
      const mockPauseInfo = createPauseInfo();

      await dispatch(actions.newSource(makeSource("foo1")));
      await dispatch(actions.newSource(makeSource("foo")));
      dispatch(actions.addExpression("foo"));
      await waitForState(store, state => selectors.getExpression(state, "foo"));

      mockThreadClient.evaluate = () => new Promise(r => r("YAY"));
      await dispatch(actions.paused(mockPauseInfo));

      await dispatch(actions.resumed());
      const expression = selectors.getExpression(getState(), "foo");
      expect(expression.value).toEqual("YAY");
    });
  });
});
