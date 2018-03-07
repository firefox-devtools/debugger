
function log(msg, data) {
  info(`${msg} ${!data ? "" : JSON.stringify(data)}`);
}

function logThreadEvents(dbg, event) {
  const thread = dbg.toolbox.threadClient;

  thread.addListener(event, function onEvent(eventName, ...args) {
    info(`Thread event '${eventName}' fired.`);
  });
}

async function waitFor(condition) {
  await BrowserTestUtils.waitForCondition(condition, "waitFor", 10, 500);
  return condition();
}

// Wait until an action of `type` is dispatched. This is different
// then `_afterDispatchDone` because it doesn't wait for async actions
// to be done/errored. Use this if you want to listen for the "start"
// action of an async operation (somewhat rare).
function waitForNextDispatch(store, type) {
  return new Promise(resolve => {
    store.dispatch({
      // Normally we would use `services.WAIT_UNTIL`, but use the
      // internal name here so tests aren't forced to always pass it
      // in
      type: "@@service/waitUntil",
      predicate: action => action.type === type,
      run: (dispatch, getState, action) => {
        resolve(action);
      }
    });
  });
}

// Wait until an action of `type` is dispatched. If it's part of an
// async operation, wait until the `status` field is "done" or "error"
function _afterDispatchDone(store, type) {
  return new Promise(resolve => {
    store.dispatch({
      // Normally we would use `services.WAIT_UNTIL`, but use the
      // internal name here so tests aren't forced to always pass it
      // in
      type: "@@service/waitUntil",
      predicate: action => {
        if (action.type === type) {
          return action.status
            ? action.status === "done" || action.status === "error"
            : true;
        }
      },
      run: (dispatch, getState, action) => {
        resolve(action);
      }
    });
  });
}

/**
 * Wait for a specific action type to be dispatch.
 * If an async action, will wait for it to be done.
 *
 * @memberof mochitest/waits
 * @param {Object} dbg
 * @param {String} type
 * @param {Number} eventRepeat
 * @return {Promise}
 * @static
 */
function waitForDispatch(dbg, type, eventRepeat = 1) {
  let count = 0;

  return Task.spawn(function*() {
    info(`Waiting for ${type} to dispatch ${eventRepeat} time(s)`);
    while (count < eventRepeat) {
      yield _afterDispatchDone(dbg.store, type);
      count++;
      info(`${type} dispatched ${count} time(s)`);
    }
  });
}

/**
 * Waits for specific thread events.
 *
 * @memberof mochitest/waits
 * @param {Object} dbg
 * @param {String} eventName
 * @return {Promise}
 * @static
 */
function waitForThreadEvents(dbg, eventName) {
  info(`Waiting for thread event '${eventName}' to fire.`);
  const thread = dbg.toolbox.threadClient;

  return new Promise(function(resolve, reject) {
    thread.addListener(eventName, function onEvent(eventName, ...args) {
      info(`Thread event '${eventName}' fired.`);
      thread.removeListener(eventName, onEvent);
      resolve.apply(resolve, args);
    });
  });
}

/**
 * Waits for `predicate(state)` to be true. `state` is the redux app state.
 *
 * @memberof mochitest/waits
 * @param {Object} dbg
 * @param {Function} predicate
 * @return {Promise}
 * @static
 */
function waitForState(dbg, predicate, msg) {
  return new Promise(resolve => {
    info(`Waiting for state change: ${msg || ""}`);
    if (predicate(dbg.store.getState())) {
      return resolve();
    }

    const unsubscribe = dbg.store.subscribe(() => {
      if (predicate(dbg.store.getState())) {
        info(`Finished waiting for state change: ${msg || ""}`);
        unsubscribe();
        resolve();
      }
    });
  });
}
