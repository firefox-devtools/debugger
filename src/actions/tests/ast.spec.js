import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../utils/test-head";

import readFixture from "./helpers/readFixture";
const { getSymbols, getEmptyLines, getOutOfScopeLocations } = selectors;
import getInScopeLines from "../../selectors/linesInScope";

const threadClient = {
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) =>
      resolve({
        source: sourceTexts[sourceId],
        contentType: "text/javascript"
      })
    );
  },
  getFrameScopes: function() {
    return Promise.resolve({});
  },
  evaluate: function(expression) {
    return new Promise((resolve, reject) =>
      resolve({ result: evaluationResult[expression] })
    );
  }
};

const sourceTexts = {
  "base.js": "function base(boo) {}",
  "foo.js": "function base(boo) { return this.bazz; } outOfScope",
  "scopes.js": readFixture("scopes.js")
};

const evaluationResult = {
  "this.bazz": { actor: "bazz", preview: {} },
  this: { actor: "this", preview: {} }
};

describe("ast", () => {
  describe("setEmptyLines", () => {
    it("scopes", async () => {
      const { dispatch, getState } = createStore(threadClient);
      const source = makeSource("scopes.js");
      await dispatch(actions.newSource(source));
      await dispatch(actions.loadSourceText({ id: "scopes.js" }));

      const emptyLines = getEmptyLines(getState(), source);
      expect(emptyLines).toMatchSnapshot();
    });
  });
  describe("setSymbols", () => {
    describe("when the source is loaded", () => {
      it("should be able to set symbols", async () => {
        const { dispatch, getState } = createStore(threadClient);
        const base = makeSource("base.js");
        await dispatch(actions.newSource(base));
        await dispatch(actions.loadSourceText({ id: "base.js" }));

        const baseSymbols = getSymbols(getState(), base);
        expect(baseSymbols).toMatchSnapshot();
      });
    });

    describe("when the source is not loaded", () => {
      it("should return an empty set", async () => {
        const { getState, dispatch } = createStore(threadClient);
        const base = makeSource("base.js");
        await dispatch(actions.newSource(base));

        const baseSymbols = getSymbols(getState(), base);
        expect(baseSymbols).toEqual({ variables: [], functions: [] });
      });
    });

    describe("when there is no source", () => {
      it("should return an empty set", async () => {
        const { getState } = createStore(threadClient);
        const baseSymbols = getSymbols(getState());
        expect(baseSymbols).toEqual({ variables: [], functions: [] });
      });
    });
  });

  describe("getOutOfScopeLocations", () => {
    it("with selected line", async () => {
      const { dispatch, getState } = createStore(threadClient);
      const source = makeSource("scopes.js");
      await dispatch(actions.newSource(source));
      await dispatch(
        actions.selectSource("scopes.js", { location: { line: 5 } })
      );

      const locations = getOutOfScopeLocations(getState());
      const lines = getInScopeLines(getState());

      expect(locations).toMatchSnapshot();
      expect(lines).toMatchSnapshot();
    });

    it("without a selected line", async () => {
      const { dispatch, getState } = createStore(threadClient);
      const base = makeSource("base.js");
      await dispatch(actions.newSource(base));
      await dispatch(actions.selectSource("base.js"));

      const locations = getOutOfScopeLocations(getState());
      const lines = getInScopeLines(getState());

      expect(locations).toEqual(null);
      expect(lines).toEqual([1]);
    });
  });

  describe("setPreview", () => {
    let dispatch = undefined;
    let getState = undefined;

    beforeEach(async () => {
      const store = createStore(threadClient);
      dispatch = store.dispatch;
      getState = store.getState;

      const foo = makeSource("foo.js");
      await dispatch(actions.newSource(foo));
      await dispatch(actions.loadSourceText({ id: "foo.js" }));
      await dispatch(actions.selectSource("foo.js"));
      await dispatch(
        actions.paused({
          why: { type: "resumeLimit" },
          frames: [{ id: "frame1", location: { sourceId: "foo.js" } }]
        })
      );
    });

    it("member expression", async () => {
      await dispatch(actions.setPreview("bazz", { line: 1, column: 34 }));
      const preview = selectors.getPreview(getState());
      expect(preview).toMatchSnapshot();
    });

    it("this", async () => {
      await dispatch(actions.setPreview("this", { line: 1, column: 30 }));
      const preview = selectors.getPreview(getState());
      expect(preview).toMatchSnapshot();
    });
  });
});
