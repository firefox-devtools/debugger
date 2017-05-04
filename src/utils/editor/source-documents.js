// @flow

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

module.exports = {
  getDocument,
  setDocument,
  removeDocument,
  clearDocuments
};
