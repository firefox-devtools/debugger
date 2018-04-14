/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  actions,
  selectors,
  createStore,
  waitForState,
  makeSource,
  makeOriginalSource,
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
  evaluate: async () => {},
  evaluateInFrame: async () => {},
  evaluateExpressions: async () => {},

  getFrameScopes: async frame => frame.scope,
  setPausePoints: async () => {},
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
        case "foo-original":
          return resolve({
            source: "\n\nfunction fooOriginal() {\n  return -5;\n}",
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

    describe("pausing in a generated location", () => {
      it("maps frame locations and names to original source", async () => {
        const generatedLocation = {
          sourceId: "foo",
          line: 1,
          column: 0
        };
        const originalLocation = {
          sourceId: "foo-original",
          line: 3,
          column: 0
        };
        const sourceMapsMock = {
          getOriginalLocation: () => Promise.resolve(originalLocation)
        };
        const store = createStore(mockThreadClient, {}, sourceMapsMock);
        const { dispatch, getState } = store;
        const mockPauseInfo = createPauseInfo(generatedLocation);

        await dispatch(actions.newSource(makeSource("foo")));
        await dispatch(actions.newSource(makeOriginalSource("foo")));
        await dispatch(actions.loadSourceText(I.Map({ id: "foo" })));
        await dispatch(actions.loadSourceText(I.Map({ id: "foo-original" })));
        await dispatch(actions.setSymbols("foo-original"));

        await dispatch(actions.paused(mockPauseInfo));
        expect(selectors.getFrames(getState())).toEqual([
          {
            id: 1,
            scope: [],
            location: originalLocation,
            generatedLocation,
            originalDisplayName: "fooOriginal"
          }
        ]);
      });
    });
  });

  describe("resumed", () => {
    it("should not evaluate expression while stepping", async () => {
      const client = { evaluateExpressions: jest.fn() };
      const { dispatch } = createStore(client);

      dispatch(actions.stepIn());
      await dispatch(actions.resumed());
      expect(client.evaluateExpressions.mock.calls).toHaveLength(1);
    });

    it("resuming - will re-evaluate watch expressions", async () => {
      const store = createStore(mockThreadClient);
      const { dispatch, getState } = store;
      const mockPauseInfo = createPauseInfo();

      await dispatch(actions.newSource(makeSource("foo1")));
      await dispatch(actions.newSource(makeSource("foo")));
      dispatch(actions.addExpression("foo"));
      await waitForState(store, state => selectors.getExpression(state, "foo"));

      mockThreadClient.evaluateExpressions = () => new Promise(r => r(["YAY"]));
      await dispatch(actions.paused(mockPauseInfo));

      await dispatch(actions.resumed());
      const expression = selectors.getExpression(getState(), "foo");
      expect(expression.value).toEqual("YAY");
    });
  });
});
