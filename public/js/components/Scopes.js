"use strict";

const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const { getPause } = require("../selectors");
const { DOM: dom } = React;
const Accordion = React.createFactory(require("./Accordion"));

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
  const functionName = displayName || "(anonymous)";

  return {
    header: `Function [${functionName}]`,
    component: () => renderScopeBindings(scope.get("bindings")),
    opened: isFirst
  };
}

/* TODO: render block with variables */
function renderBlockScope(scope, isFirst) {
  const label = "Block Scope";
  return {
    header: label,
    component: () => renderScopeBindings(scope.get("bindings")),
    opened: isFirst
  };
}

function renderObjectScope(scope, isFirst) {
  const objectClass = scope.getIn(["object", "class"]);
  const label = objectClass;

  return {
    header: label,
    component: () => dom.div(),
    opened: isFirst
  };
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
    : Accordion({ items: scopes.map(renderScope) })
  );
}

module.exports = connect(
  state => ({ pauseInfo: getPause(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
