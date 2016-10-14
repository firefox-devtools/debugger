const { getValue, isEnabled } = require("devtools-config");
const { workerTask } = require("./utils");
const {
  originalToGeneratedId,
  generatedToOriginalId,
  isGeneratedId,
  isOriginalId
} = require("./source-map-util");

let sourceMapWorker;
function restartWorker() {
  if (sourceMapWorker) {
    sourceMapWorker.terminate();
  }
  sourceMapWorker = new Worker(
    getValue("baseWorkerURL") + "source-map-worker.js"
  );

  if (isEnabled("sourceMaps")) {
    sourceMapWorker.postMessage({ id: 0, method: "enableSourceMaps" });
  }
}
restartWorker();

function destroyWorker() {
  if (sourceMapWorker) {
    sourceMapWorker.terminate();
    sourceMapWorker = null;
  }
}

const getOriginalURLs = workerTask(sourceMapWorker, "getOriginalURLs");
const getGeneratedLocation = workerTask(sourceMapWorker,
                                        "getGeneratedLocation");
const getOriginalLocation = workerTask(sourceMapWorker,
                                       "getOriginalLocation");
const getOriginalSourceText = workerTask(sourceMapWorker,
                                         "getOriginalSourceText");
const applySourceMap = workerTask(sourceMapWorker, "applySourceMap");
const clearSourceMaps = workerTask(sourceMapWorker, "clearSourceMaps");

module.exports = {
  originalToGeneratedId,
  generatedToOriginalId,
  isGeneratedId,
  isOriginalId,

  getOriginalURLs,
  getGeneratedLocation,
  getOriginalLocation,
  getOriginalSourceText,
  applySourceMap,
  clearSourceMaps,
  destroyWorker
};
