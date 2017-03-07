// @flow

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
  updateObj,
  throttle,
  waitForMs
};
