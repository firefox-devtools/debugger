// @flow

/**
 * When Flow 0.29 is released (very soon), we can use this Record type
 * instead of the builtin immutable.js Record type. This is better
 * because all the fields are actually typed, unlike the builtin one.
 * This depends on a performance fix that will go out in 0.29 though;
 * @module utils/makeRecord
 */

const I = require("immutable");

/**
 * @memberof utils/makeRecord
 * @static
 */
export type Record<T: Object> =
  & {
    get<A>(key: $Keys<T>, notSetValue?: any): A,
    getIn<A>(keyPath: Array<any>, notSetValue?: any): A,
    set<A>(key: $Keys<T>, value: A): Record<T>,
    setIn(keyPath: Array<any>, ...iterables: Array<any>): Record<T>,
    merge(values: $Shape<T>): Record<T>,
    mergeIn(keyPath: Array<any>, ...iterables: Array<any>): Record<T>,
    delete<A>(key: $Keys<T>, value: A): Record<T>,
    deleteIn(keyPath: Array<any>, ...iterables: Array<any>): Record<T>,
    toJS(): T,
  }
  & T;

/**
 * Make an immutable record type
 *
 * @param spec - the keys and their default values
 * @return a state record factory function
 * @memberof utils/makeRecord
 * @static
 */
function makeRecord<T>(spec: T & Object): (init: $Shape<T>) => Record<T> {
  return I.Record(spec);
}

module.exports = makeRecord;
