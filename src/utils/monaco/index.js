/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

export * from "./source-documents";
export * from "./source-search";

import { isWasm, lineToWasmOffset, wasmOffsetToLine } from "../wasm";
import { shouldPrettyPrint } from "../source";
import { isOriginalId } from "devtools-source-map";
import { SourceEditor } from "./source-editor";
import { features } from "../prefs";

type Editor = Object;

let editor: ?Editor;

export function createEditor() {
  return new SourceEditor({
    theme: "vs",
    readOnly: true,
    overviewRulerLanes: 0,
    selectOnLineNumbers: false,
    hideCursorInOverviewRuler: true,
    selectionHighlight: false,
    overviewRulerBorder: false,
    scrollBeyondLastLine: false,
    renderLineHighlight: "none",
    fixedOverflowWidgets: true,
    lineNumbersMinChars: 3,
    folding: features.codeFolding,
    showFoldingControls: "mouseover",
    minimap: {
      enabled: false
    },
    wordWrap: "off",
    renderIndentGuides: false,
    cursorBlinking: "blink"
  });
}

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

export function toEditorLine(sourceId: string, lineOrOffset: number): number {
  if (isWasm(sourceId)) {
    // TODO ensure offset is always "mappable" to edit line.
    // todo, is wasm 0 based or 1 based?
    const line = wasmOffsetToLine(sourceId, lineOrOffset) || 0;
    return line + 1;
  }

  return lineOrOffset ? lineOrOffset : 1;
}

export function toSourceLine(sourceId: string, line: number): ?number {
  // todo, is wasm 0 based or 1 based?
  return isWasm(sourceId) ? lineToWasmOffset(sourceId, line) : line;
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
  return (
    shouldShowPrettyPrint(selectedSource) || isOriginalId(selectedSource.id)
  );
}

export function getCursorLine(monaco): number {
  return monaco.getSelection().startLineNumber;
}
