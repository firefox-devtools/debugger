const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getSelectedFrame, getLoadedObjects, getPause } = require("../selectors");
const ObjectInspector = React.createFactory(require("./ObjectInspector"));
const { DOM: dom, PropTypes } = React;
const toPairs = require("lodash/toPairs");

require("./Scopes.css");

function info(text) {
  return dom.div({ className: "pane-info" }, text);
}

// Create the tree nodes representing all the variables and arguments
// for the bindings from a scope.
function getBindingVariables(bindings, parentName) {
  const args = bindings.arguments.map(arg => toPairs(arg)[0]);
  const variables = toPairs(bindings.variables);

  return args.concat(variables)
    .filter(binding => (
      !(binding[1].value.missingArguments || binding[1].value.optimizedOut)
    ))
    .map(binding => ({
      name: binding[0],
      path: parentName + "/" + binding[0],
      contents: binding[1]
    }));
}

function getSpecialVariables(pauseInfo, path) {
  const thrown = pauseInfo.getIn(["why", "frameFinished", "throw"]);
  const returned = pauseInfo.getIn(["why", "frameFinished", "return"]);
  const this_ = pauseInfo.getIn(["frame", "this"]);
  const vars = [];

  if (thrown) {
    // handle dehydrating excpetion strings and errors.
    thrown = thrown.toJS ? thrown.toJS() : thrown;

    vars.push({
      name: "<exception>",
      path: path + "/<exception>",
      contents: { value: thrown }
    });
  }

  if (returned) {
    vars.push({
      name: "<return>",
      path: path + "/<return>",
      contents: { value: returned.toJS() }
    });
  }

  if (this_) {
    vars.push({
      name: "<this>",
      path: path + "/<this>",
      contents: { value: this_.toJS() }
    });
  }

  return vars;
}

function getScopes(pauseInfo, selectedFrame) {
  if (!pauseInfo || !selectedFrame) {
    return null;
  }

  let scope = selectedFrame.scope;
  if (!scope) {
    return null;
  }

  const scopes = [];

  do {
    const type = scope.type;
    const key = scope.actor;
    if (type === "function" || type === "block") {
      const bindings = scope.bindings;
      let title;
      if (type === "function") {
        title = scope.function.displayName || "(anonymous)";
      } else {
        title = "Block";
      }

      let vars = getBindingVariables(bindings, title);

      // show exception, return, and this variables in innermost scope
      if (scope.actor === pauseInfo.getIn(["frame", "scope"]).get("actor")) {
        vars = vars.concat(getSpecialVariables(pauseInfo, key));
      }

      if (vars && vars.length) {
        vars.sort((a, b) => a.name.localeCompare(b.name));
        scopes.push({ name: title, path: key, contents: vars });
      }
    } else if (type === "object") {
      scopes.push({
        name: scope.object.class,
        path: key,
        contents: { value: scope.object }
      });
    }
  } while (scope = scope.parent); // eslint-disable-line no-cond-assign

  return scopes;
}

const Scopes = React.createClass({
  propTypes: {
    pauseInfo: ImPropTypes.map,
    loadedObjects: ImPropTypes.map,
    loadObjectProperties: PropTypes.func,
    selectedFrame: PropTypes.object
  },

  displayName: "Scopes",

  getInitialState() {
    const { pauseInfo, selectedFrame } = this.props;
    return { scopes: getScopes(pauseInfo, selectedFrame) };
  },

  componentWillReceiveProps(nextProps) {
    const { pauseInfo, selectedFrame } = this.props;
    const pauseInfoChanged = pauseInfo !== nextProps.pauseInfo;
    const selectedFrameChange = selectedFrame !== nextProps.selectedFrame;

    if (pauseInfoChanged || selectedFrameChange) {
      this.setState({
        scopes: getScopes(nextProps.pauseInfo, nextProps.selectedFrame)
      });
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
  state => ({
    pauseInfo: getPause(state),
    selectedFrame: getSelectedFrame(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
