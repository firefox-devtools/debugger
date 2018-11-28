/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

export * from "./source-documents";
export * from "./get-token-location";
export * from "./source-search";
export * from "../ui";
export { onMouseOver } from "./token-events";

import { createEditor } from "./create-editor";
import { shouldPrettyPrint, isOriginal } from "../source";
import { findNext, findPrev } from "./source-search";

import { isWasm, lineToWasmOffset, wasmOffsetToLine } from "../wasm";

import type { AstLocation } from "../../workers/parser";
import type { EditorPosition, EditorRange } from "../editor/types";
import type { SourceLocation } from "../../types";
type Editor = Object;

let editor: ?Editor;

export function getEditor() {
  if (editor) {
    return editor;
  }

  editor = createEditor();
  return editor;
}

export function removeEditor() {
  editor = null;
}

function getCodeMirror() {
  return editor && editor.codeMirror;
}

export function startOperation() {
  const codeMirror = getCodeMirror();
  if (!codeMirror) {
    return;
  }

  codeMirror.startOperation();
}

export function endOperation() {
  const codeMirror = getCodeMirror();
  if (!codeMirror) {
    return;
  }

  codeMirror.endOperation();
}

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
  return shouldShowPrettyPrint(selectedSource) || isOriginal(selectedSource);
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

export function toEditorLine(sourceId: string, lineOrOffset: number): number {
  if (isWasm(sourceId)) {
    // TODO ensure offset is always "mappable" to edit line.
    return wasmOffsetToLine(sourceId, lineOrOffset) || 0;
  }

  return lineOrOffset ? lineOrOffset - 1 : 1;
}

export function toEditorPosition(location: SourceLocation): EditorPosition {
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

  if (!isVisible(codeMirror, top, left)) {
    const scroller = codeMirror.getScrollerElement();
    const centeredX = Math.max(left - scroller.offsetWidth / 2, 0);
    const centeredY = Math.max(top - scroller.offsetHeight / 2, 0);

    codeMirror.scrollTo(centeredX, centeredY);
  }
}

function isVisible(codeMirror: any, top: number, left: number) {
  function withinBounds(x, min, max) {
    return x >= min && x <= max;
  }

  const scrollArea = codeMirror.getScrollInfo();
  const charWidth = codeMirror.defaultCharWidth();
  const fontHeight = codeMirror.defaultTextHeight();
  const { scrollTop, scrollLeft } = codeMirror.doc;

  const inXView = withinBounds(
    left,
    scrollLeft,
    scrollLeft + (scrollArea.clientWidth - 30) - charWidth
  );

  const inYView = withinBounds(
    top,
    scrollTop,
    scrollTop + scrollArea.clientHeight - fontHeight
  );

  return inXView && inYView;
}

export function getLocationsInViewport(_editor: any) {
  // Get scroll position
  const charWidth = _editor.codeMirror.defaultCharWidth();
  const scrollArea = _editor.codeMirror.getScrollInfo();
  const { scrollLeft } = _editor.codeMirror.doc;
  const rect = _editor.codeMirror.getWrapperElement().getBoundingClientRect();
  const topVisibleLine = _editor.codeMirror.lineAtHeight(rect.top, "window");
  const bottomVisibleLine = _editor.codeMirror.lineAtHeight(
    rect.bottom,
    "window"
  );

  const leftColumn = Math.floor(scrollLeft > 0 ? scrollLeft / charWidth : 0);
  const rightPosition = scrollLeft + (scrollArea.clientWidth - 30);
  const rightCharacter = Math.floor(rightPosition / charWidth);

  return {
    start: {
      line: topVisibleLine,
      column: leftColumn
    },
    end: {
      line: bottomVisibleLine,
      column: rightCharacter
    }
  };
}

export function markText(_editor: any, className, { start, end }: EditorRange) {
  return _editor.codeMirror.markText(
    { ch: start.column, line: start.line },
    { ch: end.column, line: end.line },
    { className }
  );
}

export function lineAtHeight(_editor, sourceId, event) {
  const _editorLine = _editor.codeMirror.lineAtHeight(event.clientY);
  return toSourceLine(sourceId, _editorLine);
}

export function getSourceLocationFromMouseEvent(
  _editor: Object,
  selectedLocation: SourceLocation,
  e: MouseEvent
) {
  const { line, ch } = _editor.codeMirror.coordsChar({
    left: e.clientX,
    top: e.clientY
  });

  return {
    sourceId: selectedLocation.sourceId,
    line: line + 1,
    column: ch + 1
  };
}

export function forEachLine(codeMirror, iter) {
  codeMirror.operation(() => {
    codeMirror.doc.iter(0, codeMirror.lineCount(), iter);
  });
}

export function removeLineClass(codeMirror, line, className) {
  codeMirror.removeLineClass(line, "line", className);
}

export function clearLineClass(codeMirror, className) {
  forEachLine(codeMirror, line => {
    removeLineClass(codeMirror, line, className);
  });
}

export function getTextForLine(codeMirror, line) {
  return codeMirror.getLine(line - 1).trim();
}

export function getCursorLine(codeMirror): number {
  return codeMirror.getCursor().line;
}
