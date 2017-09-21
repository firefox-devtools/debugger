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
  },
  getFrameScopes: () => {}
};

describe("expressions", () => {
  it("should add an expression", () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("foo"));

    expect(selectors.getExpressions(getState()).size).toBe(1);
  });

  it("should not add empty expressions", () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression());
    dispatch(actions.addExpression(""));

    expect(selectors.getExpressions(getState()).size).toBe(0);
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
    dispatch(actions.addExpression("bar"));

    expect(selectors.getExpressions(getState()).size).toBe(2);

    const expression = selectors.getExpression(getState(), "foo");
    dispatch(actions.deleteExpression(expression));

    expect(selectors.getExpressions(getState()).size).toBe(1);
    expect(selectors.getExpression(getState(), "bar").input).toBe("bar");
  });

  it("should evaluate expressions global scope", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar"));

    expect(selectors.getExpression(getState(), "foo").value).toBe(null);
    expect(selectors.getExpression(getState(), "bar").value).toBe(null);
    await dispatch(actions.evaluateExpressions());

    expect(selectors.getExpression(getState(), "foo").value).toBe("bla");
    expect(selectors.getExpression(getState(), "bar").value).toBe("bla");
  });

  it("should evaluate expressions in specific scope", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression("foo"));
    dispatch(actions.addExpression("bar"));

    expect(selectors.getExpression(getState(), "foo").value).toBe(null);
    expect(selectors.getExpression(getState(), "bar").value).toBe(null);

    await dispatch(actions.selectFrame({ id: 2, location: { line: 3 } }));
    await dispatch(actions.evaluateExpressions("boo"));

    expect(selectors.getExpression(getState(), "foo").value).toBe("boo");
    expect(selectors.getExpression(getState(), "bar").value).toBe("boo");
  });
});
