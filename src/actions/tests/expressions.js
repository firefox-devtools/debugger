import { actions, selectors, createStore } from "../../utils/test-head";

const mockThreadClient = {
  evaluate: (script, { frameId }) => {
    return new Promise((resolve, reject) => {
      if (!frameId) {
        resolve("bla");
      } else {
        resolve("boo");
      }
    });
  }
};

describe("expressions", () => {
  it("should add an expression", () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar", { visible: false }));

    expect(selectors.getExpressions(getState()).size).toBe(2);
    expect(selectors.getVisibleExpressions(getState()).size).toBe(1);
  });

  it("should make an expression visible", () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("bar", { visible: false }));
    let expression = selectors.getExpression(getState(), "bar");
    expect(expression.visible).toBe(false);

    dispatch(actions.addExpression("bar"));
    expression = selectors.getExpression(getState(), "bar");
    expect(expression.visible).toBe(true);
  });

  it("should update an expression", () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("foo"));
    const expression = selectors.getExpression(getState(), "foo");
    dispatch(actions.updateExpression("bar", expression));

    expect(selectors.getExpression(getState(), "bar").input).toBe("bar");
  });

  it("should delete an expression", () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar", { visible: false }));

    expect(selectors.getExpressions(getState()).size).toBe(2);

    const expression = selectors.getExpression(getState(), "foo");
    dispatch(actions.deleteExpression(expression));

    expect(selectors.getExpressions(getState()).size).toBe(1);
    expect(selectors.getExpression(getState(), "bar").input).toBe("bar");
  });

  it("should evaluate expressions global scope", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar", { visible: false }));

    expect(selectors.getExpression(getState(), "foo").value).toBe(null);
    expect(selectors.getExpression(getState(), "bar").value).toBe(null);
    await dispatch(actions.evaluateExpressions());

    expect(selectors.getExpression(getState(), "foo").value).toBe("bla");
    expect(selectors.getExpression(getState(), "bar").value).toBe("bla");
  });

  it("should evaluate expressions in specific scope", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar", { visible: false }));

    expect(selectors.getExpression(getState(), "foo").value).toBe(null);
    expect(selectors.getExpression(getState(), "bar").value).toBe(null);
    await dispatch(actions.evaluateExpressions("boo"));

    expect(selectors.getExpression(getState(), "foo").value).toBe("boo");
    expect(selectors.getExpression(getState(), "bar").value).toBe("boo");
  });
});
