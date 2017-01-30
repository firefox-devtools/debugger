import {
  DOM as dom, PropTypes, createClass, createFactory
} from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ImPropTypes from "react-immutable-proptypes";
import actions from "../../actions";
import { getSelectedFrame, getLoadedObjects, getPause } from "../../selectors";
const ObjectInspector = createFactory(require("../shared/ObjectInspector"));
import toPairs from "lodash/toPairs";
import "./Scopes.css";

function info(text) {
  return dom.div({ className: "pane-info" }, text);
}

// Create the tree nodes representing all the variables and arguments
// for the bindings from a scope.
function getBindingVariables(bindings, parentName) {
  const args = bindings.arguments.map(arg => toPairs(arg)[0]);
  const variables = toPairs(bindings.variables);

  return args.concat(variables)
    .map(binding => ({
      name: binding[0],
      path: `${parentName}/${binding[0]}`,
      contents: binding[1]
    }));
}

function getSpecialVariables(pauseInfo, path) {
  let thrown = pauseInfo.getIn(["why", "frameFinished", "throw"]);
  const returned = pauseInfo.getIn(["why", "frameFinished", "return"]);
  const vars = [];

  if (thrown) {
    // handle dehydrating exception strings and errors.
    thrown = thrown.toJS ? thrown.toJS() : thrown;

    vars.push({
      name: "<exception>",
      path: `${path}/<exception>`,
      contents: { value: thrown }
    });
  }

  if (returned) {
    const value = returned.toJS ? returned.toJS() : returned;
    vars.push({
      name: "<return>",
      path: `${path}/<return>`,
      contents: { value }
    });
  }

  return vars;
}

function getThisVariable(frame, path) {
  const this_ = frame.this;

  if (!this_) {
    return null;
  }

  return {
    name: "<this>",
    path: `${path}/<this>`,
    contents: { value: this_ }
  };
}

function getScopes(pauseInfo, selectedFrame) {
  if (!pauseInfo || !selectedFrame) {
    return null;
  }

  let selectedScope = selectedFrame.scope;

  if (!selectedScope) {
    return null;
  }

  const scopes = [];

  let scope = selectedScope;
  let pausedScopeActor = pauseInfo.getIn(["frame", "scope"]).get("actor");

  do {
    const type = scope.type;
    const key = scope.actor;
    if (type === "function" || type === "block") {
      const bindings = scope.bindings;
      let title;
      if (type === "function") {
        title = scope.function.displayName || "(anonymous)";
      } else {
        title = L10N.getStr("scopes.block");
      }

      let vars = getBindingVariables(bindings, title);

      // show exception, return, and this variables in innermost scope
      if (scope.actor === pausedScopeActor) {
        vars = vars.concat(getSpecialVariables(pauseInfo, key));
      }

      if (scope.actor === selectedScope.actor) {
        let this_ = getThisVariable(selectedFrame, key);

        if (this_) {
          vars.push(this_);
        }
      }

      if (vars && vars.length) {
        vars.sort((a, b) => a.name.localeCompare(b.name));
        scopes.push({ name: title, path: key, contents: vars });
      }
    } else if (type === "object") {
      let value = scope.object;
      // If this is the global window scope, mark it as such so that it will
      // preview Window: Global instead of Window: Window
      if (value.class === "Window") {
        value = Object.assign({}, scope.object, { isGlobal: true });
      }
      scopes.push({
        name: scope.object.class,
        path: key,
        contents: { value }
      });
    }
  } while (scope = scope.parent); // eslint-disable-line no-cond-assign

  return scopes;
}

const Scopes = createClass({
  propTypes: {
    pauseInfo: ImPropTypes.map,
    loadedObjects: ImPropTypes.map,
    loadObjectProperties: PropTypes.func,
    selectedFrame: PropTypes.object
  },

  displayName: "Scopes",

  shouldComponentUpdate(nextProps, nextState) {
    const { pauseInfo, selectedFrame, loadedObjects } = this.props;
    return pauseInfo !== nextProps.pauseInfo
      || selectedFrame !== nextProps.selectedFrame
      || loadedObjects !== nextProps.loadedObjects;
  },

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

    let scopeInspector = info(L10N.getStr("scopes.notAvailable"));
    if (scopes) {
      scopeInspector = ObjectInspector({
        roots: scopes,
        getObjectProperties: id => loadedObjects.get(id),
        loadObjectProperties: loadObjectProperties
      });
    }

    return dom.div(
      { className: "pane scopes-list" },
      pauseInfo
        ? scopeInspector
        : info(L10N.getStr("scopes.notPaused"))
    );
  }
});

export default connect(
  state => ({
    pauseInfo: getPause(state),
    selectedFrame: getSelectedFrame(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
