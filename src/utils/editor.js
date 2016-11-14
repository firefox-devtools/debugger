const { isPretty } = require("./source");
const { isEnabled } = require("devtools-config");
const { isOriginalId } = require("../utils/source-map");

function shouldShowPrettyPrint(selectedSource) {
  if (!isEnabled("prettyPrint")) {
    return false;
  }

  const _isPretty = isPretty(selectedSource);
  const isOriginal = isOriginalId(selectedSource.id);
  const hasSourceMap = selectedSource.sourceMapURL;

  if (_isPretty || isOriginal || hasSourceMap) {
    return false;
  }

  return true;
}

function shouldShowFooter(selectedSource) {
  return shouldShowPrettyPrint(selectedSource);
}

module.exports = {
  shouldShowPrettyPrint,
  shouldShowFooter
};
