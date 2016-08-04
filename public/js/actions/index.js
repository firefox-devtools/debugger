const breakpoints = require("./breakpoints");
const eventListeners = require("./event-listeners");
const sources = require("./sources");
const tabs = require("./tabs");
const pause = require("./pause");
const navigation = require("./navigation");

module.exports = (Object.assign(
  navigation,
  breakpoints, eventListeners, sources, tabs, pause
) : typeof breakpoints);
