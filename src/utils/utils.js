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
function truncateStr(str: any, size: any) {
  if (str.length > size) {
    return `${str.slice(0, size)}...`;
  }
  return str;
}

/**
 * @memberof utils/utils
 * @static
 */
function endTruncateStr(str: any, size: any) {
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
 * Interleaves two arrays element by element, returning the combined array, like
 * a zip. In the case of arrays with different sizes, undefined values will be
 * interleaved at the end along with the extra values of the larger array.
 *
 * @param Array a
 * @param Array b
 * @returns Array
 *          The combined array, in the form [a1, b1, a2, b2, ...]
 * @memberof utils/utils
 * @static
 */
function zip(a: any, b: any) {
  if (!b) {
    return a;
  }
  if (!a) {
    return b;
  }
  const pairs = [];
  for (let i = 0, aLength = a.length, bLength = b.length;
       i < aLength || i < bLength;
       i++) {
    pairs.push([a[i], b[i]]);
  }
  return pairs;
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
 * @memberof utils/utils
 * @static
 */
function mapObject(obj: any, iteratee: any) {
  return toObject(entries(obj).map(([key, value]) => {
    return [key, iteratee(key, value)];
  }));
}

/**
 * Takes an array of 2-element arrays as key/values pairs and
 * constructs an object using them.
 * @memberof utils/utils
 * @static
 */
function toObject(arr: any) {
  const obj = {};
  for (let pair of arr) {
    obj[pair[0]] = pair[1];
  }
  return obj;
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
  let timeout, _this; // eslint-disable-line no-shadow
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

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  handleError,
  promisify,
  truncateStr,
  endTruncateStr,
  workerTask,
  zip,
  entries,
  toObject,
  mapObject,
  compose,
  updateObj,
  throttle,
  timeout
};
