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

/**
 * @memberof utils/utils
 * @static
 */
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

export { handleError, promisify, endTruncateStr, throttle, waitForMs };
