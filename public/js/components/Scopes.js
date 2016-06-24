"use strict";

const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const classnames = require("classnames");
const { fromJS, Map } = require("immutable");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getPause, getLoadedObjects } = require("../selectors");
const { DOM: dom, PropTypes } = React;
const ManagedTree = React.createFactory(require("./util/ManagedTree"));
const Arrow = React.createFactory(require("./util/Arrow"));
const Rep = require("./Rep");

require("./Scopes.css");

function info(text) {
  return dom.div({ className: "pane-info" }, text);
}

function getBindingVariables(bindings) {
  return bindings
    .get("arguments").map(arg => arg.entrySeq().get(0))
    .concat(bindings.get("variables").entrySeq())
    .filter(binding => (!binding[1].hasIn(["value", "missingArguments"]) &&
                        !binding[1].hasIn(["value", "optimizedOut"])))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .toArray();
}

function getScopes(pauseInfo) {
  if (!pauseInfo) {
    return null;
  }

  let scope = pauseInfo.getIn(["frame", "scope"]);
  if (!scope) {
    return null;
  }

  const scopes = [];
  let index = 0;

  do {
    const type = scope.get("type");

    if (type === "function" || type === "block") {
      const bindings = scope.get("bindings");
      const vars = getBindingVariables(bindings);

      if (vars.length) {
        let title;
        if (type === "function") {
          title = scope.getIn(["function", "displayName"]) || "(anonymous)";
        } else {
          title = "Block";
        }

        scopes.push([
          title,
          Map({
            value: Map({
              type: "object",
              actor: Math.random().toString()
            }),
            isScope: true,
            prefetchedProperties: vars
          }),
        ]);
      }
    } else if (type === "object") {
      scopes.push([
        scope.getIn(["object", "class"]),
        fromJS({
          isScope: true,
          value: scope.get("object")
        })
      ]);
    }
    index++;
  } while (scope = scope.get("parent")); // eslint-disable-line no-cond-assign

  return scopes;
}

function isObject(obj) {
  return obj.getIn(["value", "type"]) === "object";
}

function loadedProperties(obj, loadedObjects) {
  return loadedObjects.get(obj.getIn(["value", "actor"])) ||
         obj.get("prefetchedProperties");
}

function sortProperties(a, b) {
  const obj = isObject(a[1]) && !isObject(b[1]) ? -10 : 10;
  const alpha = a[0] < b[0] ? -1 : 1

  return obj + alpha > 0 ? -1 : 1;
}

/**
 * Gets an object's children to show in the scope tree
 */
function getChildren(item, loadedObjects) {
  const obj = item[1];

  if (isObject(obj)) {
    const loaded = loadedProperties(obj, loadedObjects)

    if (loaded) {
      loaded.sort(sortProperties);
      return loaded;
    }

    return [["fetching...", fromJS({ value: { type: "placeholder" }})]];
  }

  return [];
}

function runderItemValue(obj) {
  let objectValue = "";
  let hasValue = false;
  if (obj.has("value")) {
    hasValue = true;
    let val = obj.get("value");
    val = val.toJS ? val.toJS() : val;
    if (isObject(obj)) {
      objectValue = "Object";
    } else {
      objectValue = Rep({ object: val });
    }
  }
  const isScope = obj.get("isScope")

  if (isScope) {
    return []
  }

  return [
    dom.span({ className: "scope-object-delimiter" }, hasValue ? ": " : ""),
    dom.span({ className: "scope-object-value" }, objectValue)
  ]
}

function renderItem(item, depth, focused, _, expanded, { setExpanded }) {
  const obj = item[1];

  return dom.div(
    { className: classnames("node", { focused }),
      style: { marginLeft: depth * 15 }},
    Arrow({
      className: classnames(
        { expanded: expanded,
          hidden: item[1].getIn(["value", "type"]) !== "object" }
      ),
      onClick: e => {
        e.stopPropagation();
        setExpanded(item, !expanded);
      }
    }),
    dom.span({ className: "scope-object-label" }, item[0]),
    ...runderItemValue(obj)
  );
}

const Scopes = React.createClass({
  propTypes: {
    pauseInfo: ImPropTypes.map,
    loadedObjects: ImPropTypes.map,
    loadObjectProperties: PropTypes.func
  },

  displayName: "Scopes",

  getInitialState() {
    return { scopes: getScopes(this.props.pauseInfo) };
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.pauseInfo !== nextProps.pauseInfo) {
      this.setState({ scopes: getScopes(nextProps.pauseInfo) });
    }
  },

  render() {
    const { pauseInfo, loadObjectProperties, loadedObjects } = this.props;
    const { scopes } = this.state;

    const tree = ManagedTree({
      itemHeight: 100,

      getParent: item => null,
      getChildren: (item) => getChildren(item, loadedObjects),
      getRoots: () => scopes,
      // TODO: make proper keys
      getKey: item => Math.random(),
      autoExpand: 0,
      onExpand: item => {
        const obj = item[1];
        if (isObject(obj) && !loadedProperties(obj, loadedObjects)) {
          loadObjectProperties(obj.get("value").toJS());
        }
      },

      renderItem: renderItem
    });

    const scopeTree = scopes ? tree : info("Scopes Unavailable");
    return dom.div(
      { className: "scopes-list" },
      (pauseInfo ? scopeTree : info("Not Paused"))
    );
  }
});

module.exports = connect(
  state => ({ pauseInfo: getPause(state),
              loadedObjects: getLoadedObjects(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
