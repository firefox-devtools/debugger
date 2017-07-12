// @flow

import { getMode } from "../source";
import type { Source } from "debugger-html";

let sourceDocs = {};

function getDocument(key: string) {
  return sourceDocs[key];
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

/**
 * Handle getting the source document or creating a new
 * document with the correct mode and text.
 */
function showSourceText(editor: Object, source: Source) {
  if (!source) {
    return;
  }

  let doc = getDocument(source.id);
  if (editor.codeMirror.doc === doc) {
    return;
  }

  if (doc) {
    editor.replaceDocument(doc);
    return doc;
  }

  doc = editor.createDocument();
  setDocument(source.id, doc);
  editor.replaceDocument(doc);

  editor.setText(source.text);
  editor.setMode(getMode(source));
}

export {
  getDocument,
  setDocument,
  removeDocument,
  clearDocuments,
  showSourceText
};
