// @flow
/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const co = require("co");
const { isDevelopment } = require("../feature");
const defer = require("./defer");

function asPaused(client: any, func: any) {
  if (client.state != "paused") {
    return co(function* () {
      yield client.interrupt();
      let result;

      try {
        result = yield func();
      } catch (e) {
        // Try to put the debugger back in a working state by resuming
        // it
        yield client.resume();
        throw e;
      }

      yield client.resume();
      return result;
    });
  }
  return func();
}

function handleError(err: any) {
  console.log("ERROR: ", err);
}

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

function truncateStr(str: any, size: any) {
  if (str.length > size) {
    return str.slice(0, size) + "...";
  }
  return str;
}

function endTruncateStr(str: any, size: any) {
  if (str.length > size) {
    return "..." + str.slice(str.length - size);
  }
  return str;
}

function workerTask(worker: any, message: any) {
  let deferred = defer();
  worker.postMessage(message);
  worker.onmessage = function(result) {
    if (result.error) {
      deferred.reject(result.error);
    }

    deferred.resolve(result.data);
  };

  return deferred.promise;
}

async function asyncMap(items: Array<any>, callback: any) {
  let newItems = [];
  for (let item of items) {
    item = await callback(item);
    newItems.push(item);
  }

  return newItems;
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
 * @param object obj
 * @returns array
 */
function entries(obj: any) {
  return Object.keys(obj).map(k => [k, obj[k]]);
}

function mapObject(obj: any, iteratee: any) {
  return toObject(entries(obj).map(([key, value]) => {
    return [key, iteratee(key, value)];
  }));
}

/**
 * Takes an array of 2-element arrays as key/values pairs and
 * constructs an object using them.
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
 */
function compose(...funcs: any) {
  return (...args: any) => {
    const initialValue = funcs[funcs.length - 1].apply(null, args);
    const leftFuncs = funcs.slice(0, -1);
    return leftFuncs.reduceRight((composed, f) => f(composed),
                                 initialValue);
  };
}

function log() {
  if (!isDevelopment()) {
    return;
  }

  console.log.apply(console, ["[log]", ...arguments]);
}

function updateObj<T>(obj: T, fields: $Shape<T>) : T {
  return Object.assign({}, obj, fields);
}

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

module.exports = {
  asPaused,
  handleError,
  promisify,
  truncateStr,
  endTruncateStr,
  workerTask,
  asyncMap,
  zip,
  entries,
  toObject,
  mapObject,
  compose,
  log,
  updateObj,
  throttle
};
