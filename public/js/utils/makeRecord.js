// @flow

// When Flow 0.29 is released (very soon), we can use this Record type
// instead of the builtin immutable.js Record type. This is better
// because all the fields are actually typed, unlike the builtin one.
// This depends on a performance fix that will go out in 0.29 though;

const I = require("immutable");

export type Record<T: Object> = {
  get<A>(key: $Keys<T>): A;
  set<A>(key: $Keys<T>, value: A): Record<T>;
  setIn(keyPath: Array<any>, ...iterables: Array<any>): Record<T>;
  merge(values: $Shape<T>): Record<T>;
  mergeIn(keyPath: Array<any>, ...iterables: Array<any>): Record<T>;
  delete<A>(key: $Keys<T>, value: A): Record<T>;
  deleteIn(keyPath: Array<any>, ...iterables: Array<any>): Record<T>;
} & T;

/**
 * Make an immutable record type
 *
 * @param spec - the keys and their default values @return a state
 * record factory function
 */
function makeRecord<T>(
  spec: T & Object
): (init: $Shape<T>) => Record<T> {
  return I.Record(spec);
}

module.exports = makeRecord;
