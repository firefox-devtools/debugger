/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isEnabled } from "devtools-config";
import * as sourceDocumentUtils from "./source-documents";
import { shouldPrettyPrint } from "../../utils/source";

import { getTokenLocation } from "./getTokenLocation.js";

import * as sourceSearchUtils from "./source-search";
const { findNext, findPrev } = sourceSearchUtils;

import { isWasm, lineToWasmOffset, wasmOffsetToLine } from "../wasm";
import { resizeBreakpointGutter } from "../ui";

import { SourceEditor, SourceEditorUtils } from "devtools-source-editor";
import { isOriginalId } from "devtools-source-map";

import type { AstPosition, AstLocation } from "../../workers/parser/types";
import type { EditorPosition, EditorRange } from "../editor/types";

function shouldShowPrettyPrint(selectedSource) {
  if (!selectedSource) {
    return false;
  }

  return shouldPrettyPrint(selectedSource);
}

function shouldShowFooter(selectedSource, horizontal) {
  if (!horizontal) {
    return true;
  }
  if (!selectedSource) {
    return false;
  }
  return (
    shouldShowPrettyPrint(selectedSource) ||
    isOriginalId(selectedSource.get("id"))
  );
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

function toEditorLine(sourceId: string, lineOrOffset: number): ?number {
  return isWasm(sourceId)
    ? wasmOffsetToLine(sourceId, lineOrOffset)
    : lineOrOffset - 1;
}

function toEditorPosition(
  sourceId: string,
  location: AstPosition
): EditorPosition {
  return {
    line: toEditorLine(sourceId, location.line),
    column: isWasm(sourceId) ? 0 : location.column
  };
}

function toEditorRange(sourceId: string, location: AstLocation): EditorRange {
  const { start, end } = location;
  return {
    start: toEditorPosition(sourceId, start),
    end: toEditorPosition(sourceId, end)
  };
}

function toSourceLine(sourceId: string, line: number): ?number {
  return isWasm(sourceId) ? lineToWasmOffset(sourceId, line) : line + 1;
}

function scrollToColumn(codeMirror: any, line: number, column: number) {
  const { top, left } = codeMirror.charCoords(
    { line: line, ch: column },
    "local"
  );

  const scroller = codeMirror.getScrollerElement();
  const centeredX = Math.max(left - scroller.offsetWidth / 2, 0);
  const centeredY = Math.max(top - scroller.offsetHeight / 2, 0);

  codeMirror.scrollTo(centeredX, centeredY);
}

function toSourceLocation(
  sourceId: string,
  location: EditorPosition
): AstPosition {
  return {
    line: toSourceLine(sourceId, location.line),
    column: isWasm(sourceId) ? undefined : location.column
  };
}

function markText(editor: any, className, location: EditorRange) {
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

function getSourceLocationFromMouseEvent(editor, selectedLocation, e) {
  const { line, ch } = editor.codeMirror.coordsChar({
    left: e.clientX,
    top: e.clientY
  });

  return {
    sourceId: selectedLocation.sourceId,
    line: line + 1,
    column: ch + 1
  };
}

module.exports = {
  ...sourceDocumentUtils,
  ...sourceSearchUtils,
  ...SourceEditorUtils,
  createEditor,
  isWasm,
  toEditorLine,
  toEditorPosition,
  toEditorRange,
  toSourceLine,
  scrollToColumn,
  toSourceLocation,
  shouldShowPrettyPrint,
  shouldShowFooter,
  traverseResults,
  markText,
  lineAtHeight,
  getSourceLocationFromMouseEvent,
  resizeBreakpointGutter,
  getTokenLocation
};
