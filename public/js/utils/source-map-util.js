// @flow

const md5 = require("md5");

function originalToGeneratedId(originalId: string) : string {
  const match = originalId.match(/(.*)\/originalSource/);
  return match ? match[1] : "";
}

function generatedToOriginalId(generatedId: string, url: string) : string {
  return generatedId + "/originalSource-" + md5(url);
}

function isOriginalId(id: string) : boolean {
  return !!id.match(/\/originalSource/);
}

function isGeneratedId(id: string) : boolean {
  return !isOriginalId(id);
}

module.exports = {
  originalToGeneratedId, generatedToOriginalId, isOriginalId, isGeneratedId
};
