/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

function hasValue(keys, store) {
  let currentStore = store;
  for (const key of keys) {
    if (!currentStore || !currentStore.has(key)) {
      return false;
    }

    currentStore = currentStore.get(key);
  }
  return true;
}

function getValue(keys, store) {
  let currentStore = store;
  for (const key of keys) {
    currentStore = currentStore.get(key);
  }

  return currentStore;
}

function setValue(keys, store, value) {
  const keysExceptLast = keys.slice(0, -1);
  const lastKey = keys[keys.length - 1];

  let currentStore = store;
  for (const key of keysExceptLast) {
    if (!currentStore.has(key)) {
      currentStore.set(key, new WeakMap());
    }
    currentStore = currentStore.get(key);
  }

  currentStore.set(lastKey, value);
}

// memoize with n arguments
export default function memoize(func) {
  const store = new WeakMap();

  return function(...keys) {
    if (hasValue(keys, store)) {
      return getValue(keys, store);
    }

    const newValue = func.apply(null, keys);
    setValue(keys, store, newValue);
    return newValue;
  };
}

// let currentStore = store;
// let index = 0
// const key = keys[index]
//
// if (store.has(key)) {
//   let value = currentStore.get(key)
//   while (value instanceof WeakMap && value.has(keys[index])) {
//     value = value.get(keys[index])
//     index++
//   }
//
//   console.log(typeof value,  value instanceof WeakMap)
//   return value;
// }
//
// const value = func.apply(null, arguments);
// currentStore.set(key, value);
// return value;
