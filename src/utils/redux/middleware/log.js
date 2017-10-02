/**
 * A middleware that logs all actions coming through the system
 * to the console.
 */
export function log({ dispatch, getState }) {
  return next => action => {
    console.log(`[DISPATCH ${action.type}]`, action);
    next(action);
  };
}
