// @flow

const { sprintf } = require("devtools-modules");
let strings = {};

function setBundle(bundle: { [key: string]: string }) {
  strings = bundle;
}

function getStr(key: string) {
  if (!strings[key]) {
    throw new Error(`L10N key ${key} cannot be found.`);
  }
  return strings[key];
}

function getFormatStr(name: string, ...args: any) {
  return sprintf(getStr(name), ...args);
}

module.exports = {
  getStr,
  getFormatStr,
  setBundle
};
