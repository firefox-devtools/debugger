/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const stubs = new Map();

stubs.set("proto-properties-symbols", {
  ownProperties: {
    a: {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 1
    }
  },
  from: "server2.conn13.child19/propertyIterator160",
  prototype: {
    type: "object",
    actor: "server2.conn13.child19/obj162",
    class: "Object",
    extensible: true,
    frozen: false,
    sealed: false,
    ownPropertyLength: 15,
    preview: {
      kind: "Object",
      ownProperties: {},
      ownSymbols: [],
      ownPropertiesLength: 15,
      ownSymbolsLength: 0,
      safeGetterValues: {}
    }
  },
  ownSymbols: [
    {
      name: "Symbol()",
      descriptor: {
        configurable: true,
        enumerable: true,
        writable: true,
        value: "hello"
      }
    }
  ]
});

module.exports = stubs;
