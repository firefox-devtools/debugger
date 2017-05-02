// @flow

import zip from "lodash/zip";

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
      timeout = setTimeout(() => {
        func.apply(_this, ...args);
        timeout = null;
      }, ms);
    }
  };
}

function waitForMs(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

type duplicatesPredicate = (any, any) => boolean;
function filterDuplicates(list: Object[], predicate: duplicatesPredicate) {
  if (list.length == 0) {
    return [];
  }

  const lastItem = list[list.length - 1];
  const pairs = zip(list.slice(1), list.slice(0, -1));
  return pairs.filter(predicate).map(([prev, item]) => item).concat(lastItem);
}

export {
  handleError,
  promisify,
  endTruncateStr,
  updateObj,
  throttle,
  waitForMs,
  filterDuplicates
};
