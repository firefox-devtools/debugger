/**
 * Redux middleware that sets performance markers for all actions such that they
 * will appear in performance tooling under the User Timing API
 */

const mark = window.performance && window.performance.mark
  ? window.performance.mark
  : () => {};

const measure = window.performance && window.performance.measure
  ? window.performance.measure
  : () => {};

export function timing(store) {
  return next => action => {
    mark(`${action.type}_start`);
    const result = next(action);
    mark(`${action.type}_end`);
    measure(`${action.type}`, `${action.type}_start`, `${action.type}_end`);
    return result;
  };
}
