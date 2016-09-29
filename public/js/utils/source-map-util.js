const md5 = require("md5");

function originalToGeneratedId(originalId) {
  const match = originalId.match(/(.*)\/originalSource/);
  return match ? match[1] : null;
}

function generatedToOriginalId(generatedId, url) {
  return generatedId + "/originalSource-" + md5(url);
}

function isOriginalId(id) {
  return id.match(/\/originalSource/);
}

function isGeneratedId(id) {
  return !isOriginalId(id);
}

module.exports = {
  originalToGeneratedId, generatedToOriginalId, isOriginalId, isGeneratedId
};
