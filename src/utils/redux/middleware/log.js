/**
 * A middleware that logs all actions coming through the system
 * to the console.
 */
export default function log({ dispatch, getState }) {
  return next => action => {
    const actionText = JSON.stringify(action, null, 2);
    const truncatedActionText = `${actionText.slice(0, 1000)}...`;
    console.log(`[DISPATCH ${action.type}]`, action, truncatedActionText);
    next(action);
  };
}
