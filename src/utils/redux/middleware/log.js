/**
 * A middleware that logs all actions coming through the system
 * to the console.
 */
export function log({ dispatch, getState }) {
  return next => action => {
    const asyncMsg = !action.status
      ? ""
      : action.status == "done" ? `<-` : `->`;
    console.log(action, asyncMsg);
    next(action);
  };
}
