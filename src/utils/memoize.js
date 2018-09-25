/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// memoize with n arguments
export default function memoize(n, func) {
  const store = new WeakMap();

  return function(...keys) {
    let currentStore = store;

    for (let i = 0; i < n - 1; i++) {
      const key = keys[i];
      if (!currentStore.has(key)) {
        currentStore.set(key, new WeakMap());
      }

      currentStore = currentStore.get(key);
    }

    const lastKey = keys[n - 1];

    if (currentStore.has(lastKey)) {
      return currentStore.get(lastKey);
    }

    const value = func.apply(null, arguments);
    currentStore.set(lastKey, value);
    return value;
  };
}
