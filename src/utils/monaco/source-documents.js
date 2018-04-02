import SourceEditor from "./source-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import { StaticServices } from "monaco-editor/esm/vs/editor/standalone/browser/standaloneServices";

const models = {};

function getDocument(key: string) {
  return models[key];
}

function hasDocument(key: string) {
  return !!getDocument(key);
}

function setDocument(key: string, doc: any) {
  models[key] = doc;
}

function removeDocument(key: string) {
  delete models[key];
}

function clearDocuments() {
  models = {};
}

function updateLineNumberFormat() {}

function createModel(value, language, uri, isForSimpleWidget) {
  return StaticServices.modelService
    .get()
    .createModel(
      value,
      StaticServices.modeService.get().getOrCreateMode(language),
      uri,
      true
    );
}

function updateDocument(editor: SourceEditor, source: SourceRecord) {
  if (!source) {
    return;
  }

  const sourceId = source.get("id");
  const doc = getDocument(sourceId) || createModel("", "plaintext", null, true);
  editor.replaceDocument(doc);

  //   updateLineNumberFormat(editor, sourceId);
}

function clearEditor(editor: SourceEditor) {
  const doc = createModel("", "plaintext", null, true);
  editor.replaceDocument(doc);
  //   resetLineNumberFormat(editor);
}

function showSourceText(
  editor: Object,
  source: Source,
  symbols?: SymbolDeclarations
) {
  if (!source) {
    return;
  }

  const { text, id: sourceId } = source;

  if (hasDocument(sourceId)) {
    const doc = getDocument(sourceId);
    if (editor.monaco.getModel() === doc) {
      return;
    }

    editor.replaceDocument(doc);
    updateLineNumberFormat(editor, sourceId);
    // editor.setMode(getMode(source, symbols));
    return doc;
  }

  // workaround: avoid guessIndentation for large content.
  const doc = createModel("", "javascript", null, true);
  doc.setValue(text);
  setDocument(sourceId, doc);
  editor.replaceDocument(doc);
  updateLineNumberFormat(editor, sourceId);
}

function showErrorMessage(editor: Object, msg: string) {
  let error;
  if (msg.includes("WebAssembly binary source is not available")) {
    error = L10N.getStr("wasmIsNotAvailable");
  } else {
    error = L10N.getFormatStr("errorLoadingText3", msg);
  }
  const doc = createModel(error, "plaintext", null, true);
  editor.replaceDocument(doc);
  //   resetLineNumberFormat(editor);
}

function showLoading(editor: SourceEditor) {
  if (hasDocument("loading")) {
    return;
  }

  const doc = monaco.editor.createModel(
    L10N.getStr("loadingText"),
    "plaintext"
  );
  setDocument("loading", doc);
  editor.replaceDocument(doc);
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
