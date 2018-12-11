/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Utils for utils, by utils
 * @module utils/utils
 */

/**
 * @memberof utils/utils
 * @static
 */
export function handleError(err: any) {
  console.log("ERROR: ", err);
}

/**
 * @memberof utils/utils
 * @static
 */
export function promisify(
  context: any,
  method: any,
  ...args: any
): Promise<mixed> {
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
export function endTruncateStr(str: any, size: number) {
  if (str.length > size) {
    return `…${str.slice(str.length - size)}`;
  }
  return str;
}

export function waitForMs(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function downloadDataFile(data: string, fileName: string) {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  const blob = new Blob([data], { type: "text/javascript" });
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  document.body.removeChild(a);
}
