/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

export * from "./source-documents";
export * from "./getTokenLocation.js";
export * from "./source-search";
export * from "../ui";
export * from "devtools-source-editor";

import { isEnabled } from "devtools-config";
import { shouldPrettyPrint } from "../source";
import { findNext, findPrev } from "./source-search";
import { isWasm, lineToWasmOffset, wasmOffsetToLine } from "../wasm";
import { SourceEditor } from "devtools-source-editor";
import { isOriginalId } from "devtools-source-map";

import type { AstPosition, AstLocation } from "../../workers/parser/types";
import type { EditorPosition, EditorRange } from "../editor/types";

export function shouldShowPrettyPrint(selectedSource) {
  if (!selectedSource) {
    return false;
  }

  return shouldPrettyPrint(selectedSource);
}

export function shouldShowFooter(selectedSource, horizontal) {
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

export function traverseResults(e, ctx, query, dir, modifiers) {
  e.stopPropagation();
  e.preventDefault();

  if (dir == "prev") {
    findPrev(ctx, query, true, modifiers);
  } else if (dir == "next") {
    findNext(ctx, query, true, modifiers);
  }
}

export function createEditor() {
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

export function toEditorLine(sourceId: string, lineOrOffset: number): ?number {
  if (isWasm(sourceId)) {
    return wasmOffsetToLine(sourceId, lineOrOffset);
  }

  return lineOrOffset ? lineOrOffset - 1 : 1;
}

export function toEditorPosition(location: AstPosition): EditorPosition {
  return {
    line: toEditorLine(location.sourceId, location.line),
    column: isWasm(location.sourceId) || !location.column ? 0 : location.column
  };
}

export function toEditorRange(
  sourceId: string,
  location: AstLocation
): EditorRange {
  const { start, end } = location;
  return {
    start: toEditorPosition({ ...start, sourceId }),
    end: toEditorPosition({ ...end, sourceId })
  };
}

export function toSourceLine(sourceId: string, line: number): ?number {
  return isWasm(sourceId) ? lineToWasmOffset(sourceId, line) : line + 1;
}

export function scrollToColumn(codeMirror: any, line: number, column: number) {
  const { top, left } = codeMirror.charCoords(
    { line: line, ch: column },
    "local"
  );

  const scroller = codeMirror.getScrollerElement();
  const centeredX = Math.max(left - scroller.offsetWidth / 2, 0);
  const centeredY = Math.max(top - scroller.offsetHeight / 2, 0);

  codeMirror.scrollTo(centeredX, centeredY);
}

export function toSourceLocation(
  sourceId: string,
  location: EditorPosition
): AstPosition {
  return {
    line: toSourceLine(sourceId, location.line),
    column: isWasm(sourceId) ? undefined : location.column
  };
}

export function markText(editor: any, className, location: EditorRange) {
  const { start, end } = location;

  return editor.codeMirror.markText(
    { ch: start.column, line: start.line },
    { ch: end.column, line: end.line },
    { className }
  );
}

export function lineAtHeight(editor, sourceId, event) {
  const editorLine = editor.codeMirror.lineAtHeight(event.clientY);
  return toSourceLine(sourceId, editorLine);
}

export function getSourceLocationFromMouseEvent(editor, selectedLocation, e) {
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
