const breakpoints = require("./breakpoints");
const eventListeners = require("./event-listeners");
const sources = require("./sources");

module.exports = Object.assign({}, breakpoints, eventListeners, sources);
