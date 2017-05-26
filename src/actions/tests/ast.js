import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../utils/test-head";

const { getSymbols } = selectors;

const threadClient = {
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) =>
      resolve({
        source: sourceTexts[sourceId],
        contentType: "text/javascript"
      })
    );
  }
};

const sourceTexts = {
  "base.js": "function base(boo) {}"
};

describe("ast", () => {
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
});
