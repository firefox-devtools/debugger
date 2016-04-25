"use strict";

/**
 * A middleware that allows thunks (functions) to be dispatched. If
 * it's a thunk, it is called with an argument that contains
 * `dispatch`, `getState`, and any additional args passed in via the
 * middleware constructure. This allows the action to create multiple
 * actions (most likely asynchronously).
 */
function thunk(makeArgs) {
  return ({ dispatch, getState }) => {
    const args = { dispatch, getState };

    return next => action => {
      return (typeof action === "function")
        ? action(makeArgs ? makeArgs(args) : args)
        : next(action);
    };
  };
}
exports.thunk = thunk;
