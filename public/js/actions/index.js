// @flow

const constants = require("../constants");
const breakpoints = require("./breakpoints");
const eventListeners = require("./event-listeners");
const sources = require("./sources");
const tabs = require("./tabs");
const pause = require("./pause");

function willNavigate() {
  return { type: constants.NAVIGATE };
}

function navigate() {
  return ({ dispatch }) => {
    // We need to load all the sources again because they might have
    // come from bfcache, so we won't get a `newSource` notification.
    //
    // TODO: This seems to be buggy on the debugger server side. When
    // the page is loaded from bfcache, we still get sources from the
    // *previous* page as well. For now, emulate the current debugger
    // behavior by not showing sources loaded by bfcache.
    // return dispatch(sources.loadSources());
  };
}

module.exports = (Object.assign(
  ({ willNavigate, navigate }: any),
  breakpoints, eventListeners, sources, tabs, pause
) : typeof breakpoints);
