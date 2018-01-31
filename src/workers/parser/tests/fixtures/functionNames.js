/* eslint-disable */

({
  foo: function() {},
  "foo": function() {},
  42: function() {},

  foo() {},
  "foo"() {},
  42() {},
});

foo = function() {};
obj.foo = function() {};

var foo = function(){};
var [foo = function(){}] = [];
var {foo = function(){}} = {};

[foo = function(){}] = [];
({foo = function(){}} = {});
({bar: foo = function(){}} = {});

function fn([foo = function(){}]){}
function fn({foo = function(){}} = {}){}
function fn({bar: foo = function(){}} = {}){}

class Cls {
  foo = function() {};
  "foo" = function() {};
  42 = function() {};

  foo() {}
  "foo"() {}
  42() {}
}

(function(){});

export default function (){}
