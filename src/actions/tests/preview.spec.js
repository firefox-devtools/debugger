import {
  createStore,
  selectors,
  actions,
  makeSource
} from "../../utils/test-head";
import I from "immutable";
import readFixture from "./helpers/readFixture";
import { prefs } from "../../utils/prefs";

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

describe("setPreview", () => {
  let dispatch = undefined;
  let getState = undefined;

  beforeEach(async () => {
    const store = createStore(threadClient);
    prefs.autoPrettyPrint = false;

    dispatch = store.dispatch;
    getState = store.getState;

    const foo = makeSource("foo.js");
    await dispatch(actions.newSource(foo));
    await dispatch(actions.loadSourceText(I.Map({ id: "foo.js" })));
    await dispatch(actions.selectLocation({ sourceId: "foo.js" }));
    await dispatch(actions.setSymbols("foo.js"));
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
