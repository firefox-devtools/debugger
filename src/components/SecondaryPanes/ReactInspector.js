// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ImPropTypes from "react-immutable-proptypes";
import actions from "../../actions";
import { getSelectedFrame, getLoadedObjects, getPause } from "../../selectors";
import { getScopes } from "../../utils/scopes";
const ObjectInspector = createFactory(
  require("../shared/ObjectInspector").default
);

function info(text) {
  return dom.div({ className: "pane-info" }, text);
}

let expandedCache = new Set();
let actorsCache = [];

class ReactInspector extends Component {
  state: {
    scopes: any
  };

  constructor(props, ...args) {
    super(props, ...args);

    this.state = this.getState(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { pauseInfo, selectedFrame, loadedObjects } = this.props;
    return (
      pauseInfo !== nextProps.pauseInfo ||
      selectedFrame !== nextProps.selectedFrame ||
      loadedObjects !== nextProps.loadedObjects
    );
  }

  componentWillReceiveProps(nextProps) {
    const { pauseInfo, selectedFrame } = this.props;
    const pauseInfoChanged = pauseInfo !== nextProps.pauseInfo;
    const selectedFrameChange = selectedFrame !== nextProps.selectedFrame;

    if (pauseInfoChanged || selectedFrameChange) {
      this.setState(this.getState(nextProps));
    }
  }

  getState(props) {
    props = props || this.props;
    const { pauseInfo, selectedFrame } = props;
    const scopes = getScopes(pauseInfo, selectedFrame);
    const blockScopes = this.getScopeGrips(scopes, "Block");
    const thisScope = this.getScopeGrips(blockScopes, "<this>");
    const thisScopeProperties = this.getScopeGripsOwnProperties(thisScope);
    // return {
    //   props: null,
    //   state: null,
    //   refs: null,
    //   context: null
    // };
    return {
      scopes: getScopes(pauseInfo, selectedFrame),
      thisScopeProperties
    };
  }

  prepareComponentRoots(root) {
    root.name = "React Component";
    const value = root.contents.value;
    value.class = "React.Component";
    return [root];
  }

  getScopeGrips(records, identifier) {
    if (!records) {
      return null;
    }
    const grips = records.filter(scope => scope.name === identifier);
    if (grips && grips[0]) {
      return grips[0].contents;
    }
    return null;
  }

  getScopeGripsOwnProperties(grip) {
    if (!grip) {
      return null;
    }
    const { loadedObjects, loadObjectProperties } = this.props;
    const value = grip.value;
    loadObjectProperties(value);
    const gripObject = loadedObjects.get(value.actor);
    return (gripObject && gripObject.ownProperties) || null;
  }

  getObjectInspectorProps(root) {
    const { loadObjectProperties, loadedObjects } = this.props;
    return {
      root,
      getObjectProperties: id => loadedObjects.get(id),
      loadObjectProperties: loadObjectProperties,
      setExpanded: expanded => {
        expandedCache = expanded;
      },
      getExpanded: () => expandedCache,
      setActors: actors => {
        actorsCache = actors;
      },
      getActors: () => actorsCache,
      onLabelClick: (item, { expanded, setExpanded }) => {
        setExpanded(item, !expanded);
      }
    };
  }

  renderComponent() {
    let componentInspector;
    const { scopes } = this.state;
    const blockScope = this.getScopeGrips(scopes, "Block");
    const thisScope = this.getScopeGrips(blockScope, "<this>");
    const thisScopeProperties = this.getScopeGripsOwnProperties(thisScope);
    if (!thisScopeProperties) {
      componentInspector = info(L10N.getStr("scopes.notAvailable"));
    } else {
      const componentScope = this.prepareComponentRoots(thisScope);
      if (componentScope) {
        componentInspector = ObjectInspector(
          this.getObjectInspectorProps(componentScope)
        );
      }
    }

    return componentInspector;
  }

  render() {
    const { pauseInfo } = this.props;
    return dom.div(
      { className: "pane scopes-list" },
      pauseInfo ? this.renderComponent() : info(L10N.getStr("scopes.notPaused"))
    );
  }
}

ReactInspector.displayName = "ReactComponents";

ReactInspector.propTypes = {
  pauseInfo: ImPropTypes.map,
  loadedObjects: ImPropTypes.map,
  loadObjectProperties: PropTypes.func,
  selectedFrame: PropTypes.object,
  evaluateRawExpression: PropTypes.func
};

export default connect(
  state => ({
    pauseInfo: getPause(state),
    selectedFrame: getSelectedFrame(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(ReactInspector);
