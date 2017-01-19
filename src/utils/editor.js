const { isPretty, isJavaScript } = require("./source");
const { isOriginalId } = require("../utils/source-map");

function shouldShowPrettyPrint(selectedSource) {
  if (!selectedSource) {
    return false;
  }

  selectedSource = selectedSource.toJS();
  const _isPretty = isPretty(selectedSource);
  const _isJavaScript = isJavaScript(selectedSource.url);
  const isOriginal = isOriginalId(selectedSource.id);
  const hasSourceMap = selectedSource.sourceMapURL;

  if (_isPretty || isOriginal || hasSourceMap || !_isJavaScript) {
    return false;
  }

  return true;
}

function onKeyDown(codeMirror, e) {
  let { key, target } = e;
  let codeWrapper = codeMirror.getWrapperElement();
  let textArea = codeWrapper.querySelector("textArea");

  if (key === "Escape" && target == textArea) {
    e.stopPropagation();
    e.preventDefault();
    codeWrapper.focus();
  } else if (key === "Enter" && target == codeWrapper) {
    e.preventDefault();
    // Focus into editor's text area
    textArea.focus();
  }
}

function shouldShowFooter(selectedSource, horizontal) {
  if (!horizontal) {
    return true;
  }

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
  onKeyDown
};
