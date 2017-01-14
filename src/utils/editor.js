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

function forEachLine(codeMirror, iter) {
  codeMirror.doc.iter(0, codeMirror.lineCount(), iter);
}

function removeLineClass(codeMirror, line, className) {
  codeMirror.removeLineClass(line, "line", className);
}

function clearLineClass(codeMirror, className) {
  forEachLine(codeMirror, line => {
    removeLineClass(codeMirror, line, className);
  });
}

module.exports = {
  shouldShowPrettyPrint,
  shouldShowFooter,
  clearLineClass,
};
