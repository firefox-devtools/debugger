// @flow
/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Utils for utils, by utils
 * @module utils/utils
 */

/**
 * @memberof utils/utils
 * @static
 */
function handleError(err: any) {
  console.log("ERROR: ", err);
}

/**
 * @memberof utils/utils
 * @static
 */
function promisify(context: any, method: any, ...args: any) {
  return new Promise((resolve, reject) => {
    args.push(response => {
      if (response.error) {
        reject(response);
      } else {
        resolve(response);
      }
    });
    method.apply(context, args);
  });
}

/**
 * @memberof utils/utils
 * @static
 */
function endTruncateStr(str: any, size: number) {
  if (str.length > size) {
    return `...${str.slice(str.length - size)}`;
  }
  return str;
}

/**
 * @memberof utils/utils
 * @static
 */
function updateObj<T: Object>(obj: T, fields: $Shape<T>): T {
  return Object.assign({}, obj, fields);
}

/**
 * @memberof utils/utils
 * @static
 */
function throttle(func: any, ms: number) {
  let timeout, _this;
  return function(...args: any) {
    _this = this;
    if (!timeout) {
      timeout = setTimeout(
        () => {
          func.apply(_this, ...args);
          timeout = null;
        },
        ms
      );
    }
  };
}

function waitForMs(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  handleError,
  promisify,
  endTruncateStr,
  updateObj,
  throttle,
  waitForMs
};
