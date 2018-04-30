/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { actions, selectors, createStore } from "../../utils/test-head";

const mockThreadClient = {
  evaluateInFrame: (script, frameId) =>
    new Promise((resolve, reject) => {
      if (!frameId) {
        resolve("bla");
      } else {
        resolve("boo");
      }
    }),
  evaluateExpressions: (inputs, frameId) =>
    Promise.all(
      inputs.map(
        input =>
          new Promise((resolve, reject) => {
            if (!frameId) {
              resolve("bla");
            } else {
              resolve("boo");
            }
          })
      )
    ),
  getFrameScopes: async () => {},
  sourceContents: () => ({}),
  autocomplete: () => {
    return new Promise(resolve => {
      resolve({
        from: "foo",
        matches: ["toLocaleString", "toSource", "toString", "toolbar", "top"],
        matchProp: "to"
      });
    });
  }
};

describe("expressions", () => {
  it("should add an expression", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    await dispatch(actions.addExpression("foo"));
    expect(selectors.getExpressions(getState()).size).toBe(1);
  });

  it("should not add empty expressions", () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    dispatch(actions.addExpression());
    dispatch(actions.addExpression(""));

    expect(selectors.getExpressions(getState()).size).toBe(0);
  });

  it("should not add invalid expressions", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);
    await dispatch(actions.addExpression("foo#"));
    const state = getState();
    expect(selectors.getExpressions(state).size).toBe(0);
    expect(selectors.getExpressionError(state)).toBe(true);
  });

  it("should update an expression", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    await dispatch(actions.addExpression("foo"));
    const expression = selectors.getExpression(getState(), "foo");
    await dispatch(actions.updateExpression("bar", expression));

    expect(selectors.getExpression(getState(), "bar").input).toBe("bar");
  });

  it("should not update an expression w/ invalid code", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    await dispatch(actions.addExpression("foo"));
    const expression = selectors.getExpression(getState(), "foo");
    await dispatch(actions.updateExpression("#bar", expression));
    expect(selectors.getExpression(getState(), "bar")).toBeUndefined();
  });

  it("should delete an expression", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    await dispatch(actions.addExpression("foo"));
    await dispatch(actions.addExpression("bar"));

    expect(selectors.getExpressions(getState()).size).toBe(2);

    const expression = selectors.getExpression(getState(), "foo");
    dispatch(actions.deleteExpression(expression));

    expect(selectors.getExpressions(getState()).size).toBe(1);
    expect(selectors.getExpression(getState(), "bar").input).toBe("bar");
  });

  it("should evaluate expressions global scope", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    await dispatch(actions.addExpression("foo"));
    await dispatch(actions.addExpression("bar"));

    expect(selectors.getExpression(getState(), "foo").value).toBe("bla");
    expect(selectors.getExpression(getState(), "bar").value).toBe("bla");

    await dispatch(actions.evaluateExpressions());

    expect(selectors.getExpression(getState(), "foo").value).toBe("bla");
    expect(selectors.getExpression(getState(), "bar").value).toBe("bla");
  });

  it("should evaluate expressions in specific scope", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);
    await createFrames(dispatch);

    await dispatch(actions.addExpression("foo"));
    await dispatch(actions.addExpression("bar"));

    expect(selectors.getExpression(getState(), "foo").value).toBe("boo");
    expect(selectors.getExpression(getState(), "bar").value).toBe("boo");

    await dispatch(actions.evaluateExpressions());

    expect(selectors.getExpression(getState(), "foo").value).toBe("boo");
    expect(selectors.getExpression(getState(), "bar").value).toBe("boo");
  });

  it("should get the autocomplete matches for the input", async () => {
    const { dispatch, getState } = createStore(mockThreadClient);

    await dispatch(actions.autocomplete("to", 2));

    expect(
      selectors.getAutocompleteMatchset(getState(), "to")
    ).toMatchSnapshot();
  });
});

async function createFrames(dispatch) {
  const sourceId = "example.js";
  const frame = {
    id: 2,
    location: { sourceId, line: 3 }
  };

  await dispatch(actions.newSource({ id: sourceId }));

  await dispatch(
    actions.paused({
      frames: [frame],
      why: { type: "just because" }
    })
  );

  await dispatch(actions.selectFrame(frame));
}
