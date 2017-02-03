// @flow

/**
 * Immutable JS conversion utils
 * @deprecated
 * @module utils/fromJS
 */

const Immutable = require("immutable");

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
    return Immutable.Seq(value).map(fromJS).toList();
  }
  if (value && value.constructor.meta) {
    // This adds support for tcomb objects which are native JS objects
    // but are not "plain", so the above checks fail. Since they
    // behave the same we can use the same constructors, but we need
    // special checks for them.
    const kind = value.constructor.meta.kind;
    if (kind === "struct") {
      return Immutable.Seq(value).map(fromJS).toMap();
    } else if (kind === "list") {
      return Immutable.Seq(value).map(fromJS).toList();
    }
  }

  // If it's a primitive type, just return the value. Note `==` check
  // for null, which is intentionally used to match either `null` or
  // `undefined`.
  if (value == null || (typeof value !== "object")) {
    return value;
  }

  // Immutable.Seq recognizes any object with numeric length property as
  // an array. Replacing array-like grip with something that does not behave
  // length property.
  if (typeof value.length === "number" && ("items" in value) &&
      value.kind === "ArrayLike") {
    value = Object.create(value, {
      length: {
        get: () => void 0,
        enumerable: true,
        configurable: true
      },
      size: {
        value: value.length,
        writable: true,
        enumerable: true,
        configurable: true
      },
    });
  }

  // Otherwise, treat it like an object. We can't reliably detect if
  // it's a plain object because we might be objects from other JS
  // contexts so `Object !== Object`.
  return Immutable.Seq(value).map(fromJS).toMap();
}

module.exports = fromJS;
