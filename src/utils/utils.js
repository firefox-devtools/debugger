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

let msgId = 1;
/**
 * @memberof utils/utils
 * @static
 */
function workerTask(worker: any, method: string) {
  return function(...args: any) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      worker.postMessage({ id, method, args });

      const listener = ({ data: result }) => {
        if (result.id !== id) {
          return;
        }

        worker.removeEventListener("message", listener);
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result.response);
        }
      };

      worker.addEventListener("message", listener);
    });
  };
}

/**
 * Converts an object into an array with 2-element arrays as key/value
 * pairs of the object. `{ foo: 1, bar: 2}` would become
 * `[[foo, 1], [bar 2]]` (order not guaranteed);
 *
 * @returns array
 * @memberof utils/utils
 * @static
 */
function entries(obj: any) {
  return Object.keys(obj).map(k => [k, obj[k]]);
}

/**
 * Composes the given functions into a single function, which will
 * apply the results of each function right-to-left, starting with
 * applying the given arguments to the right-most function.
 * `compose(foo, bar, baz)` === `args => foo(bar(baz(args)`
 *
 * @param ...function funcs
 * @returns function
 * @memberof utils/utils
 * @static
 */
function compose(...funcs: any) {
  return (...args: any) => {
    const initialValue = funcs[funcs.length - 1].apply(null, args);
    const leftFuncs = funcs.slice(0, -1);
    return leftFuncs.reduceRight((composed, f) => f(composed),
                                 initialValue);
  };
}

/**
 * @memberof utils/utils
 * @static
 */
function updateObj<T: Object>(obj: T, fields: $Shape<T>) : T {
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

module.exports = {
  handleError,
  promisify,
  endTruncateStr,
  workerTask,
  entries,
  compose,
  updateObj,
  throttle,
  waitForMs
};
