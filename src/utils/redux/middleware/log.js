/**
 * A middleware that logs all actions coming through the system
 * to the console.
 */
export function log({ dispatch, getState }) {
  return next => action => {
    const status = action.status == "done" ? "<-" : "->";
    const asyncMsg = !action.status ? "" : status;
    console.log(action, asyncMsg);
    next(action);
  };
}
