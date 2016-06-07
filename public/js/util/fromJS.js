"use strict";

const Immutable = require("immutable");

// When our app state is fully types, we should be able to get rid of
// this function. This is only temporarily necessary to support
// converting typed objects to immutable.js, which usually happens in
// reducers.
function fromJS(value) {
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

  // Otherwise, treat it like an object. We can't reliably detect if
  // it's a plain object because we might be objects from other JS
  // contexts so `Object !== Object`.
  return Immutable.Seq(value).map(fromJS).toMap();
}

module.exports = fromJS;
