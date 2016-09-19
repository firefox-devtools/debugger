let sourceDocs = {};

function getDocument(key) {
  return sourceDocs[key];
}

function setDocument(key, doc) {
  sourceDocs[key] = doc;
}

function removeDocument(key) {
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
