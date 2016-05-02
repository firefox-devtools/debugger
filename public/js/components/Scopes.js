"use strict";

const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const { getPause } = require("../selectors");
const { DOM: dom } = React;

require("./Scopes.css");

function getScopes(pauseInfo) {
  if (!pauseInfo) {
    return [];
  }

  const environment = pauseInfo.getIn(["frame", "environment"]);
  let scope = environment;
  const scopes = [ scope ];

  while (scope = scope.get("parent")) { // eslint-disable-line no-cond-assign
    scopes.push(scope);
  }

  return scopes;
}

function renderArgumentProperty(argumentBinding) {
  const argumentName = argumentBinding.keySeq().first();
  const actor = argumentBinding.first().getIn(["value", "actor"]);
  return dom.li(
    { className: "scope-property-list-item", key: actor },
    argumentName
  );
}

function renderVariableProperty(variableBinding, variableName) {
  const actor = variableBinding.getIn(["value", "actor"]);
  return dom.li(
    { className: "scope-property-list-item", key: actor },
    variableName
  );
}

function renderScopeBindings(bindings) {
  const variableBindings = bindings.get("variables");
  const argumentBindings = bindings.get("arguments");

  return dom.ul(
    { className: "scope-property-list" },
    argumentBindings.map(renderArgumentProperty),
    variableBindings.map(renderVariableProperty)
  );
}

function renderFunctionScope(scope, isFirst) {
  const displayName = scope.getIn(["function", "displayName"]);
  const functionClass = scope.getIn(["function", "class"]);

  const label = displayName || functionClass;
  return dom.li(
    { className: "scope-item", key: scope.get("actor") },
    dom.div({ className: "scope-label" }, (isFirst ? "Local " : "") + label),
    renderScopeBindings(scope.get("bindings"))
  );
}

/* TODO: render block with variables */
function renderBlockScope(scope, isFirst) {
  const label = "Block Scope";
  return dom.li(
    { className: "scope-item", key: scope.get("actor") },
    dom.div({ className: "scope-label" }, (isFirst ? "Local " : "") + label),
    renderScopeBindings(scope.get("bindings"))
  );
}

function renderObjectScope(scope) {
  const objectClass = scope.getIn(["object", "class"]);
  const label = objectClass;

  return dom.li(
    { className: "scope-item", key: scope.get("actor") },
    dom.div({ className: "scope-label" }, label)
  );
}

function renderScope(scope, index) {
  const isFirst = index == 0;

  switch (scope.get("type")) {
    case "function": return renderFunctionScope(scope, isFirst);
    case "block": return renderBlockScope(scope, isFirst);
    default: return renderObjectScope(scope, isFirst);
  }
}

function Scopes({ pauseInfo }) {
  const scopes = getScopes(pauseInfo);
  return dom.div({ className: "scopes-pane" },
    !pauseInfo ?
    dom.div({ className: "pane-info" }, "Not Paused")
    : dom.ul({ className: "scopes-list" }, scopes.map(renderScope))
  );
}

module.exports = connect(
  state => ({ pauseInfo: getPause(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
