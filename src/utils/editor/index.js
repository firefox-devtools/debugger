const { isPretty, isJavaScript } = require("../source");
const { isOriginalId } = require("devtools-source-map");
const buildQuery = require("./build-query");
const {
  getDocument,
  setDocument,
  removeDocument,
  clearDocuments
} = require("./source-documents");

const {
  countMatches,
  find,
  findNext,
  findPrev,
  removeOverlay,
  clearIndex
} = require("./source-search");

const SourceEditor = require("./source-editor");

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

function isTextForSource(sourceText) {
  return !sourceText.get("loading") && !sourceText.get("error");
}

function breakpointAtLine(breakpoints, line) {
  return breakpoints.find(b => {
    return b.location.line === line + 1;
  });
}

function getTextForLine(codeMirror, line) {
  return codeMirror.getLine(line - 1).trim();
}

function getCursorLine(codeMirror) {
  return codeMirror.getCursor().line;
}

function getTokenLocation(tokenEl, codeMirror) {
  const lineOffset = 1;
  const { left, top } = tokenEl.getBoundingClientRect();
  const { line, ch } = codeMirror.coordsChar({ left, top });

  return {
    line: line + lineOffset,
    column: ch
  };
}
/**
 * Forces the breakpoint gutter to be the same size as the line
 * numbers gutter. Editor CSS will absolutely position the gutter
 * beneath the line numbers. This makes it easy to be flexible with
 * how we overlay breakpoints.
 */
function resizeBreakpointGutter(editor) {
  const gutters = editor.display.gutters;
  const lineNumbers = gutters.querySelector(".CodeMirror-linenumbers");
  const breakpoints = gutters.querySelector(".breakpoints");
  breakpoints.style.width = `${lineNumbers.clientWidth}px`;
}

function traverseResults(e, ctx, query, dir, modifiers) {
  e.stopPropagation();
  e.preventDefault();

  if (dir == "prev") {
    findPrev(ctx, query, true, modifiers);
  } else if (dir == "next") {
    findNext(ctx, query, true, modifiers);
  }
}

function createEditor() {
  return new SourceEditor({
    mode: "javascript",
    readOnly: true,
    lineNumbers: true,
    theme: "mozilla",
    lineWrapping: false,
    matchBrackets: true,
    showAnnotationRuler: true,
    enableCodeFolding: false,
    gutters: ["breakpoints", "hit-markers"],
    value: " ",
    extraKeys: {
      // Override code mirror keymap to avoid conflicts with split console.
      Esc: false,
      "Cmd-F": false,
      "Cmd-G": false
    }
  });
}

module.exports = {
  createEditor,
  shouldShowPrettyPrint,
  shouldShowFooter,
  clearLineClass,
  onKeyDown,
  buildQuery,
  getDocument,
  setDocument,
  removeDocument,
  clearDocuments,
  countMatches,
  find,
  findNext,
  findPrev,
  clearIndex,
  removeOverlay,
  isTextForSource,
  breakpointAtLine,
  getTextForLine,
  getCursorLine,
  getTokenLocation,
  resizeBreakpointGutter,
  traverseResults
};
