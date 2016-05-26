// TODO: This is an experiment for applying tcomb's type system to
// Immutable.js Records. This file is not used anywhere yet but I'd
// like to go ahead and commit it in preparation for applying types to
// all the state.

var assert = require('tcomb/lib/assert');
var isTypeName = require('tcomb/lib/isTypeName');
var String = require('tcomb/lib/String');
var Function = require('tcomb/lib/Function');
var isBoolean = require('tcomb/lib/isBoolean');
var isObject = require('tcomb/lib/isObject');
var isNil = require('tcomb/lib/isNil');
var create = require('tcomb/lib/create');
var getTypeName = require('tcomb/lib/getTypeName');
var dict = require('tcomb/lib/dict');
var getDefaultInterfaceName = require('tcomb/lib/getDefaultInterfaceName');
var extend = require('tcomb/lib/extend');
var Immutable = require('immutable');

function getDefaultName(props) {
  return 'ImStruct' + getDefaultInterfaceName(props);
}

function extendStruct(mixins, name) {
  return extend(struct, mixins, name);
}

function getOptions(options) {
  if (!isObject(options)) {
    options = isNil(options) ? {} : { name: options };
  }
  if (!options.hasOwnProperty('strict')) {
    options.strict = imstruct.strict;
  }
  return options;
}

function imstruct(props, options) {

  options = getOptions(options);
  var name = options.name;
  var strict = options.strict;

  if (process.env.NODE_ENV !== 'production') {
    assert(dict(String, Function).is(props), function () { return 'Invalid argument props ' + assert.stringify(props) + ' supplied to struct(props, [options]) combinator (expected a dictionary String -> Type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to struct(props, [options]) combinator (expected a string)'; });
    assert(isBoolean(strict), function () { return 'Invalid argument strict ' + assert.stringify(strict) + ' supplied to struct(props, [options]) combinator (expected a boolean)'; });
  }

  var displayName = name || getDefaultName(props);

  var desc = {};
  Object.keys(props).forEach(k => desc[k] = null);
  var recordType = Immutable.Record(desc, name);

  function ImStruct(value, path) {

    if (ImStruct.is(value)) { // implements idempotency
      return value;
    }

    if (process.env.NODE_ENV !== 'production') {
      path = path || [displayName];
      assert(isObject(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected an object)'; });
      // strictness
      if (strict) {
        for (k in value) {
          if (value.hasOwnProperty(k)) {
            assert(props.hasOwnProperty(k), function () { return 'Invalid additional prop "' + k + '" supplied to ' + path.join('/'); });
          }
        }
      }
    }

    if (!(this instanceof ImStruct)) { // `new` is optional
      return new ImStruct(value, path);
    }

    var data = {};
    for (var k in props) {
      if (props.hasOwnProperty(k)) {
        var expected = props[k];
        var actual = value[k];
        data[k] = create(
          expected, actual,
          process.env.NODE_ENV !== 'production' ?
            path.concat(k + ': ' + getTypeName(expected)) :
            null
        );
      }
    }

    recordType.call(this, data);
    this.__path = path;
  }

  ImStruct.prototype = Object.create(recordType.prototype);
  ImStruct.prototype.constructor = recordType;

  ImStruct.prototype.set = function(key, val) {
    return Immutable.Record.prototype.set.call(
      this,
      key,
      create(
        props[key],
        val,
        process.env.NODE_ENV !== 'production' ?
          this.__path.concat(key + ': ' + getTypeName(props[key])) :
          null
      )
    );
  }

  // Guard against a common mistake. Immutable does not map records in
  // the way that you expect: https://github.com/facebook/immutable-js/issues/645
  ImStruct.prototype.map = function(key, val) {
    throw new Error(
      "You should not be mapping a record; immutable does not support this"
    );
  }

  ImStruct.meta = {
    kind: 'imstruct',
    props: props,
    name: name,
    identity: false,
    strict: strict
  };

  ImStruct.displayName = displayName;

  ImStruct.is = function (x) {
    return x instanceof ImStruct;
  };

  return ImStruct;
}

imstruct.strict = false;
imstruct.getOptions = getOptions;
imstruct.getDefaultName = getDefaultName;
module.exports = imstruct;
