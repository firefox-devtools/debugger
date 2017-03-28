const { isPretty, isJavaScript } = require("../source");
const { isOriginalId } = require("devtools-source-map");
const buildQuery = require("./build-query");
const {
  getDocument,
  setDocument,
  removeDocument,
  clearDocuments,
} = require("./source-documents");

import {
  getTokenLocation,
  getExpressionFromToken,
  previewExpression,
} from "./expression.js";

const {
  countMatches,
  find,
  findNext,
  findPrev,
  removeOverlay,
  clearIndex,
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
      "Cmd-G": false,
    },
  });
}

function updateDocument(editor, selectedSource, sourceText) {
  if (selectedSource) {
    let sourceId = selectedSource.get("id");
    const doc = getDocument(sourceId) || editor.createDocument();
    editor.replaceDocument(doc);
  } else if (sourceText) {
    this.setText(sourceText.get("text"));
  }
}

module.exports = {
  createEditor,
  shouldShowPrettyPrint,
  shouldShowFooter,
  clearLineClass,
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
  resizeBreakpointGutter,
  traverseResults,
  getTokenLocation,
  getExpressionFromToken,
  previewExpression,
  updateDocument,
};
