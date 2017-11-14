/* eslint max-nested-callbacks: ["error", 6] */

import {
  createStore,
  selectors,
  actions,
  makeSource,
  waitForState
} from "../../utils/test-head";

import readFixture from "./helpers/readFixture";
const {
  getSymbols,
  getEmptyLines,
  getOutOfScopeLocations,
  getSourceMetaData
} = selectors;
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
  "scopes.js": readFixture("scopes.js"),
  "reactComponent.js": readFixture("reactComponent.js")
};

const evaluationResult = {
  "this.bazz": { actor: "bazz", preview: {} },
  this: { actor: "this", preview: {} }
};

describe("ast", () => {
  describe("setEmptyLines", () => {
    it("scopes", async () => {
      const store = createStore(threadClient);
      const { dispatch, getState } = store;

      const source = makeSource("scopes.js");
      await dispatch(actions.newSource(source));
      await dispatch(actions.loadSourceText({ id: "scopes.js" }));

      await waitForState(store, state => {
        const lines = getEmptyLines(state, source);
        return lines && lines.length > 0;
      });

      const emptyLines = getEmptyLines(getState(), source);
      expect(emptyLines).toMatchSnapshot();
    });
  });
  describe("setSourceMetaData", () => {
    it("should detect react components", async () => {
      const store = createStore(threadClient);
      const { dispatch, getState } = store;
      const source = makeSource("reactComponent.js");
      await dispatch(actions.newSource(source));

      await dispatch(actions.loadSourceText({ id: "reactComponent.js" }));
      await waitForState(store, state => {
        const metaData = getSourceMetaData(state, source.id);
        return metaData && metaData.isReactComponent;
      });

      const sourceMetaData = getSourceMetaData(getState(), source.id);
      expect(sourceMetaData).toEqual({ isReactComponent: true });
    });

    it("should not give false positive on non react components", async () => {
      const store = createStore(threadClient);
      const { dispatch, getState } = store;
      const source = makeSource("base.js");
      await dispatch(actions.newSource(source));
      await dispatch(actions.loadSourceText({ id: "base.js" }));
      await waitForState(store, state => {
        const metaData = getSourceMetaData(state, source.id);
        return metaData && metaData.isReactComponent === false;
      });

      const sourceMetaData = getSourceMetaData(getState(), source.id);
      expect(sourceMetaData).toEqual({ isReactComponent: false });
    });
  });

  describe("setSymbols", () => {
    describe("when the source is loaded", () => {
      it("should be able to set symbols", async () => {
        const store = createStore(threadClient);
        const { dispatch, getState } = store;
        const base = makeSource("base.js");
        await dispatch(actions.newSource(base));
        await dispatch(actions.loadSourceText({ id: "base.js" }));
        await waitForState(store, state => getSymbols(state, base));

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
