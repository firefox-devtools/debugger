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

function info(text) {
  return dom.div({ className: "pane-info" }, text);
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

  do {
    const type = scope.get("type");

    if (type === "function" || type === "block") {
      const bindings = scope.get("bindings");
      const vars = bindings
        .get("arguments").map(arg => arg.entrySeq().get(0))
        .concat(bindings.get("variables").entrySeq())
        .filter(binding => (!binding[1].hasIn(["value", "missingArguments"]) &&
                            !binding[1].hasIn(["value", "optimizedOut"])))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .toArray();

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
            prefetchedProperties: vars
          }),
        ]);
      }
    } else if (type === "object") {
      scopes.push([
        scope.getIn(["object", "class"]),
        fromJS({
          value: scope.get("object")
        })
      ]);
    }
  } while (scope = scope.get("parent")); // eslint-disable-line no-cond-assign

  return scopes;
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

  getChildren(item) {
    const { loadedObjects } = this.props;
    const obj = item[1];

    if (obj.get("prefetchedProperties")) {
      return obj.get("prefetchedProperties");
    } else if (obj.getIn(["value", "type"]) === "object") {
      const loaded = loadedObjects.get(obj.getIn(["value", "actor"]));

      if (loaded) {
        return loaded;
      }
      return [["fetching...", fromJS({ value: { type: "placeholder" }})]];
    }
    return [];
  },

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const obj = item[1];
    let val = "";
    if (obj.has("value") && !obj.hasIn(["value", "type"])) {
      val = ": " + obj.get("value");
    }

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
      item[0] + val
    );
  },

  render() {
    const { pauseInfo, loadObjectProperties } = this.props;
    const { scopes } = this.state;

    const tree = ManagedTree({
      itemHeight: 100,
      getParent: item => null,
      getChildren: this.getChildren,
      getRoots: () => scopes,
      // TODO: make proper keys
      getKey: item => Math.random(),
      autoExpand: 0,
      onExpand: item => {
        const obj = item[1];
        if (!obj.has("prefetchedProperties") &&
           obj.getIn(["value", "type"]) === "object") {
          loadObjectProperties(obj.get("value").toJS());
        }
      },

      renderItem: this.renderItem
    });

    const scopeTree = scopes ? tree : info("Scopes Unavailable");
    return dom.div(
      { className: "scopes-pane" },
      (pauseInfo ? scopeTree : info("Not Paused"))
    );
  }
});

module.exports = connect(
  state => ({ pauseInfo: getPause(state),
              loadedObjects: getLoadedObjects(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
