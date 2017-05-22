const get = require("lodash/get");
const { findElementWithSelector, info } = require("./shared");

/**
 * Waits for `predicate(state)` to be true. `state` is the redux app state.
 *
 * @memberof mochitest/waits
 * @param {Object} dbg
 * @param {Function} predicate
 * @return {Promise}
 * @static
 */
async function waitForState(dbg, predicate) {
  return new Promise(resolve => {
    const unsubscribe = dbg.store.subscribe(() => {
      if (predicate(dbg.store.getState())) {
        unsubscribe();
        resolve();
      }
    });
  });
}

async function waitForPaused(dbg) {
  // We want to make sure that we get both a real paused event and
  // that the state is fully populated. The client may do some more
  // work (call other client methods) before populating the state.
  await waitForThreadEvents(dbg, "paused"), await waitForState(dbg, state => {
    const pause = dbg.selectors.getPause(state);
    // Make sure we have the paused state.
    if (!pause) {
      return false;
    }
    // Make sure the source text is completely loaded for the
    // source we are paused in.
    const sourceId = get(pause, "frame.location.sourceId");
    const sourceText = dbg.selectors.getSourceText(dbg.getState(), sourceId);
    return sourceText && !sourceText.get("loading");
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
async function waitForDispatch(
  dbg,
  type,
  { useLaunchpad = false, eventRepeat = 1 } = {}
) {
  const store = useLaunchpad ? dbg.launchpadStore : dbg.store;
  let count = 0;

  info("Waiting for " + type + " to dispatch " + eventRepeat + " time(s)");
  while (count < eventRepeat) {
    await _afterDispatchDone(store, type);
    count++;
    info(type + " dispatched " + count + " time(s)");
  }
}

// Wait until an action of `type` is dispatched. If it's part of an
// async operation, wait until the `status` field is "done" or "error"
async function _afterDispatchDone(store, type) {
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

// Wait until an action of `type` is dispatched. This is different
// than `_afterDispatchDone` because it doesn't wait for async actions
// to be done/errored. Use this if you want to listen for the "start"
// action of an async operation (somewhat rare).
async function waitForNextDispatch(store, type) {
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

async function waitForTime(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, time);
  });
}

async function waitForSources(dbg, ...sources) {
  if (sources.length === 0) {
    return Promise.resolve();
  }

  function sourceExists(state, url) {
    return getSources(state).some(s => {
      const sourceUrl = s.get("url");
      return sourceUrl && sourceUrl.includes(url);
    });
  }

  info("Waiting on sources: " + sources.join(", "));
  const { selectors: { getSources }, store } = dbg;
  return Promise.all(
    sources.map(url => {
      if (!sourceExists(store.getState(), url)) {
        return waitForState(dbg, () => sourceExists(store.getState(), url));
      }
    })
  );
}

async function waitForElement(dbg, selector) {
  return waitUntil(() => findElementWithSelector(dbg, selector));
}

async function waitUntil(predicate, interval = 20) {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (predicate()) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
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
async function waitForThreadEvents(dbg, eventName) {
  info("Waiting for thread event '" + eventName + "' to fire.");
  const thread = dbg.threadClient;

  return new Promise(function(resolve, reject) {
    thread.addListener(eventName, function onEvent(eventName) {
      info("Thread event '" + eventName + "' fired.");
      thread.removeListener(eventName, onEvent);
      resolve.apply(resolve);
    });
  });
}

async function waitForTargetEvent(dbg, eventName) {
  info("Waiting for target event '" + eventName + "' to fire.");
  const tabTarget = dbg.tabTarget;

  return new Promise(function(resolve, reject) {
    tabTarget.on(eventName, function onEvent(eventName) {
      info("Thread event '" + eventName + "' fired.");
      tabTarget.off(eventName, onEvent);
      resolve.apply(resolve);
    });
  });
}

module.exports = {
  waitForPaused,
  waitForDispatch,
  waitForTime,
  waitForSources,
  waitForElement,
  waitForTargetEvent,
  waitForThreadEvents,
  waitUntil
};
