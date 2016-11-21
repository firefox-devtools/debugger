const { isPretty, isJavaScript } = require("./source");
const { isOriginalId } = require("../utils/source-map");

function shouldShowPrettyPrint(selectedSource) {
  const _isPretty = isPretty(selectedSource);
  const _isJavaScript = isJavaScript(selectedSource.url);
  const isOriginal = isOriginalId(selectedSource.id);
  const hasSourceMap = selectedSource.sourceMapURL;

  if (_isPretty || isOriginal || hasSourceMap || !_isJavaScript) {
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
