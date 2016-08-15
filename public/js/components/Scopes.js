const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getPause, getLoadedObjects } = require("../selectors");
const ObjectInspector = React.createFactory(require("./ObjectInspector"));
const { DOM: dom, PropTypes } = React;

require("./Scopes.css");

function info(text) {
  return dom.div({ className: "pane-info" }, text);
}

// Create the tree nodes representing all the variables and arguments
// for the bindings from a scope.
function getBindingVariables(bindings, parentName) {
  return bindings
    .get("arguments").map(arg => arg.entrySeq().get(0))
    .concat(bindings.get("variables").entrySeq())
    .filter(binding => (!binding[1].hasIn(["value", "missingArguments"]) &&
                        !binding[1].hasIn(["value", "optimizedOut"])))
    .map(binding => ({
      name: binding[0],
      path: parentName + "/" + binding[0],
      contents: binding[1].toJS()
    }))
    .toArray();
}

function getSpecialVariables(pauseInfo, parentName) {
  const thrown = pauseInfo.getIn(["why", "frameFinished", "throw"]);
  const returned = pauseInfo.getIn(["why", "frameFinished", "return"]);
  const this_ = pauseInfo.getIn(["frame", "this"]);
  const vars = [];

  if (thrown) {
    // handle dehydrating excpetion strings and errors.
    thrown = thrown.toJS ? thrown.toJS() : thrown;

    vars.push({
      name: "<exception>",
      path: parentName + "/<exception>",
      contents: { value: thrown }
    });
  }

  if (returned) {
    vars.push({
      name: "<return>",
      path: parentName + "/<return>",
      contents: { value: returned.toJS() }
    });
  }

  if (this_) {
    vars.push({
      name: "<this>",
      path: parentName + "/<this>",
      contents: { value: this_.toJS() }
    });
  }

  return vars;
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
      let title;
      if (type === "function") {
        title = scope.getIn(["function", "displayName"]) || "(anonymous)";
      } else {
        title = "Block";
      }

      let vars = getBindingVariables(bindings, title);

      // Innermost
      if (scope === pauseInfo.getIn(["frame", "scope"])) {
        vars = vars.concat(getSpecialVariables(pauseInfo, title));
      }

      if (vars.length) {
        vars.sort((a, b) => a.name.localeCompare(b.name));
        scopes.push({ name: title, path: title, contents: vars });
      }
    } else if (type === "object") {
      scopes.push({
        name: scope.getIn(["object", "class"]),
        path: scope.getIn(["object", "class"]),
        contents: { value: scope.get("object").toJS() }
      });
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

  render() {
    const { pauseInfo, loadObjectProperties, loadedObjects } = this.props;
    const { scopes } = this.state;

    let scopeInspector = info("Scopes Unavailable");
    if (scopes) {
      scopeInspector = ObjectInspector({
        roots: scopes,
        getObjectProperties: id => loadedObjects.get(id),
        loadObjectProperties: loadObjectProperties
      });
    }

    return dom.div(
      { className: "pane scopes-list" },
      pauseInfo ? scopeInspector : info("Not Paused")
    );
  }
});

module.exports = connect(
  state => ({ pauseInfo: getPause(state),
              loadedObjects: getLoadedObjects(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
