import { isEnabled } from "devtools-config";
import { isPretty, isJavaScript } from "../source";
import { isOriginalId } from "devtools-source-map";
import * as sourceDocumentUtils from "./source-documents";

import * as expressionUtils from "./expression.js";

import * as sourceSearchUtils from "./source-search";
const { findNext, findPrev } = sourceSearchUtils;

import { isWasm, lineToWasmOffset, wasmOffsetToLine } from "../wasm";

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

function toEditorLine(sourceId: string, lineOrOffset: number) {
  return isWasm(sourceId)
    ? wasmOffsetToLine(sourceId, lineOrOffset)
    : lineOrOffset - 1;
}

function toEditorLocation(sourceId: string, location: any) {
  return {
    line: toEditorLine(sourceId, location.line),
    column: isWasm(sourceId) ? 0 : location.column
  };
}

function toSourceLine(sourceId: string, line: number) {
  return isWasm(sourceId) ? lineToWasmOffset(sourceId, line) : line + 1;
}

function toSourceLocation(sourceId: string, location: any) {
  return {
    line: toSourceLine(sourceId, location.line),
    column: isWasm(sourceId) ? undefined : location.column
  };
}

function markText(editor: any, className, location: any) {
  const { start, end } = location;

  return editor.codeMirror.markText(
    { ch: start.column, line: start.line },
    { ch: end.column, line: end.line },
    { className }
  );
}

function lineAtHeight(editor, sourceId, event) {
  const editorLine = editor.codeMirror.lineAtHeight(event.clientY);
  return toSourceLine(sourceId, editorLine);
}

module.exports = Object.assign(
  {},
  expressionUtils,
  sourceDocumentUtils,
  sourceSearchUtils,
  SourceEditorUtils,
  {
    createEditor,
    isWasm,
    toEditorLine,
    toEditorLocation,
    toSourceLine,
    toSourceLocation,
    shouldShowPrettyPrint,
    shouldShowFooter,
    traverseResults,
    markText,
    lineAtHeight
  }
);
