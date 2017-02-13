// @flow

/**
 * Immutable JS conversion utils
 * @deprecated
 * @module utils/fromJS
 */

const Immutable = require("immutable");

/*
  creates an immutable map, where each of the value's
  items are transformed into their own map.

  NOTE: we guard against `length` being a property because
  length confuses Immutable's internal algorithm.
*/
function createMap(value) {
  const hasLength = value.hasOwnProperty("length");
  const length = value.length;

  if (hasLength) {
    value.length = `${ value.length}`;
  }

  let map = Immutable.Seq(value).map(fromJS).toMap();

  if (hasLength) {
    map = map.set("length", length);
    value.length = length;
  }

  return map;
}

function createList(value) {
  return Immutable.Seq(value).map(fromJS).toList();
}

/**
 * When our app state is fully typed, we should be able to get rid of
 * this function. This is only temporarily necessary to support
 * converting typed objects to immutable.js, which usually happens in
 * reducers.
 *
 * @memberof utils/fromJS
 * @static
 */
function fromJS(value: any) : any {
  if (Array.isArray(value)) {
    return createList(value);
  }
  if (value && value.constructor.meta) {
    // This adds support for tcomb objects which are native JS objects
    // but are not "plain", so the above checks fail. Since they
    // behave the same we can use the same constructors, but we need
    // special checks for them.
    const kind = value.constructor.meta.kind;
    if (kind === "struct") {
      return createMap(value);
    } else if (kind === "list") {
      return createList(value);
    }
  }

  // If it's a primitive type, just return the value. Note `==` check
  // for null, which is intentionally used to match either `null` or
  // `undefined`.
  if (value == null || (typeof value !== "object")) {
    return value;
  }

  // Otherwise, treat it like an object. We can't reliably detect if
  // it's a plain object because we might be objects from other JS
  // contexts so `Object !== Object`.

  return createMap(value);
}

module.exports = fromJS;
