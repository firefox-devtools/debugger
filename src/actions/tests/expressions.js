import expect from "expect.js";
import {
  actions,
  selectors,
  createStore
} from "../../utils/test-head";

const mockThreadClient = {
  evaluate: (script, { frameId }) => {
    return new Promise((resolve, reject) => {
      resolve("bla");
    });
  }
}

describe("expressions", () => {
  it("should add an expression", () => {
    const { dispatch, getState } = createStore();

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar", { visible: false }));

    expect(selectors.getExpressions(getState()).size).to.be(2);
    expect(selectors.getVisibleExpressions(getState()).size).to.be(1);
  });

  it("should update an expression", () => {
    const { dispatch, getState } = createStore();

    dispatch(actions.addExpression("foo"));
    const expression = selectors.getExpression(getState(), "foo");
    dispatch(actions.updateExpression("bar", expression));

    expect(selectors.getExpression(getState(), "bar").input).to.be("bar");

  });

  it("should delete an expression", () => {
    const { dispatch, getState } = createStore();

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar", { visible: false }));

    expect(selectors.getExpressions(getState()).size).to.be(2);

    const expression = selectors.getExpression(getState(), "foo");
    dispatch(actions.deleteExpression(expression));

    expect(selectors.getExpressions(getState()).size).to.be(1);
    expect(selectors.getExpression(getState(), "bar").input).to.be("bar");
  });

  it("should evaluate expressions", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);
    const frameId = "baa";

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar", { visible: false }));

    expect(selectors.getExpression(getState(), "foo").value).to.be(null);
    expect(selectors.getExpression(getState(), "bar").value).to.be(null);

    await dispatch(actions.evaluateExpressions(frameId))

    expect(selectors.getExpression(getState(), "foo").value).to.be("bla");
    expect(selectors.getExpression(getState(), "bar").value).to.be("bla");

  });

});
