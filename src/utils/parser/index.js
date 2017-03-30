// @flow

const { workerUtils: { WorkerDispatcher } } = require("devtools-utils");

const dispatcher = new WorkerDispatcher();

const getSymbols = dispatcher.task("getSymbols");
const getVariablesInScope = dispatcher.task("getVariablesInScope");
const getExpression = dispatcher.task("getExpression");

module.exports = {
  getSymbols,
  getVariablesInScope,
  getExpression,
  startParserWorker: dispatcher.start.bind(dispatcher),
  stopParserWorker: dispatcher.stop.bind(dispatcher),
};
