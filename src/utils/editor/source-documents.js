/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getMode } from "../source";

import { isWasm, getWasmLineNumberFormatter, renderWasmText } from "../wasm";
import { resizeBreakpointGutter, resizeToggleButton } from "../ui";
import SourceEditor from "./source-editor";

import type { Source, SourceRecord } from "../../types";
import type { SymbolDeclarations } from "../../workers/parser";

let sourceDocs = {};

function getDocument(key: string) {
  return sourceDocs[key];
}

function hasDocument(key: string) {
  return !!getDocument(key);
}

function setDocument(key: string, doc: any) {
  sourceDocs[key] = doc;
}

function removeDocument(key: string) {
  delete sourceDocs[key];
}

function clearDocuments() {
  sourceDocs = {};
}

function resetLineNumberFormat(editor: SourceEditor) {
  const cm = editor.codeMirror;
  cm.setOption("lineNumberFormatter", number => number);
  resizeBreakpointGutter(cm);
  resizeToggleButton(cm);
}

function updateLineNumberFormat(editor: SourceEditor, sourceId: string) {
  if (!isWasm(sourceId)) {
    return resetLineNumberFormat(editor);
  }
  const cm = editor.codeMirror;
  const lineNumberFormatter = getWasmLineNumberFormatter(sourceId);
  cm.setOption("lineNumberFormatter", lineNumberFormatter);
  resizeBreakpointGutter(cm);
  resizeToggleButton(cm);
}

function updateDocument(editor: SourceEditor, source: SourceRecord) {
  if (!source) {
    return;
  }

  const sourceId = source.get("id");
  const doc = getDocument(sourceId) || editor.createDocument();
  editor.replaceDocument(doc);

  updateLineNumberFormat(editor, sourceId);
}

function clearEditor(editor: SourceEditor) {
  const doc = editor.createDocument();
  editor.replaceDocument(doc);
  editor.setText("");
  editor.setMode({ name: "text" });
  resetLineNumberFormat(editor);
}

function showLoading(editor: SourceEditor) {
  if (hasDocument("loading")) {
    return;
  }

  const doc = editor.createDocument();
  setDocument("loading", doc);
  editor.replaceDocument(doc);
  editor.setText(L10N.getStr("loadingText"));
  editor.setMode({ name: "text" });
}

function showErrorMessage(editor: Object, msg: string) {
  let error;
  if (msg.includes("WebAssembly binary source is not available")) {
    error = L10N.getStr("wasmIsNotAvailable");
  } else {
    error = L10N.getFormatStr("errorLoadingText3", msg);
  }
  const doc = editor.createDocument();
  editor.replaceDocument(doc);
  editor.setText(error);
  editor.setMode({ name: "text" });
  resetLineNumberFormat(editor);
}

function setEditorText(editor: Object, source: Source) {
  const { text, id: sourceId } = source;
  if (source.isWasm) {
    const wasmLines = renderWasmText(sourceId, (text: any));
    // cm will try to split into lines anyway, saving memory
    const wasmText = { split: () => wasmLines, match: () => false };
    editor.setText(wasmText);
  } else {
    editor.setText(text);
  }
}

/**
 * Handle getting the source document or creating a new
 * document with the correct mode and text.
 */
function showSourceText(
  editor: Object,
  source: Source,
  symbols?: SymbolDeclarations
) {
  if (!source) {
    return;
  }

  if (hasDocument(source.id)) {
    const doc = getDocument(source.id);
    if (editor.codeMirror.doc === doc) {
      const mode = getMode(source, symbols);

      if (doc.mode.name !== mode.name) {
        editor.setMode(mode);
      }

      return;
    }

    editor.replaceDocument(doc);
    updateLineNumberFormat(editor, source.id);
    editor.setMode(getMode(source, symbols));
    return doc;
  }

  const doc = editor.createDocument();
  setDocument(source.id, doc);
  editor.replaceDocument(doc);

  setEditorText(editor, source);
  editor.setMode(getMode(source, symbols));
  updateLineNumberFormat(editor, source.id);
}

export {
  getDocument,
  setDocument,
  hasDocument,
  removeDocument,
  clearDocuments,
  updateLineNumberFormat,
  updateDocument,
  clearEditor,
  showSourceText,
  showErrorMessage,
  showLoading
};
