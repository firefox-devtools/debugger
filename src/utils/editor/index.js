import { isEnabled } from "devtools-config";
import { isPretty, isJavaScript } from "../source";
import { isOriginalId } from "devtools-source-map";
import * as sourceDocumentUtils from "./source-documents";
const { getDocument } = sourceDocumentUtils;

import * as expressionUtils from "./expression.js";

import * as sourceSearchUtils from "./source-search";
const { findNext, findPrev } = sourceSearchUtils;

import { SourceEditor, SourceEditorUtils } from "devtools-source-editor";

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

function breakpointAtLocation(breakpoints, { line, column = undefined }) {
  return breakpoints.find(bp => {
    const sameLine = bp.location.line === line + 1;
    if (!sameLine) {
      return false;
    }

    // NOTE: when column breakpoints are disabled we want to find
    // the first breakpoint
    if (!isEnabled("columnBreakpoints")) {
      return true;
    }

    return bp.location.column === column;
  });
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
  const gutters = ["breakpoints", "hit-markers", "CodeMirror-linenumbers"];

  if (isEnabled("codeFolding")) {
    gutters.push("CodeMirror-foldgutter");
  }

  return new SourceEditor({
    mode: "javascript",
    foldGutter: isEnabled("codeFolding"),
    enableCodeFolding: isEnabled("codeFolding"),
    readOnly: true,
    lineNumbers: true,
    theme: "mozilla",
    styleActiveLine: false,
    lineWrapping: false,
    matchBrackets: true,
    showAnnotationRuler: true,
    gutters,
    value: " ",
    extraKeys: {
      // Override code mirror keymap to avoid conflicts with split console.
      Esc: false,
      "Cmd-F": false,
      "Cmd-G": false
    }
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

module.exports = Object.assign(
  {},
  expressionUtils,
  sourceDocumentUtils,
  sourceSearchUtils,
  SourceEditorUtils,
  {
    createEditor,
    shouldShowPrettyPrint,
    shouldShowFooter,
    breakpointAtLocation,
    traverseResults,
    updateDocument
  }
);
