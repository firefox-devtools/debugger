// @flow
import { DOM as dom, PropTypes, PureComponent, createFactory } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ImPropTypes from "react-immutable-proptypes";
import actions from "../../actions";
import { getSelectedFrame, getLoadedObjects, getPause } from "../../selectors";
import { getScopes } from "../../utils/scopes";

import _ObjectInspector from "../shared/ObjectInspector";
const ObjectInspector = createFactory(_ObjectInspector);

import "./Scopes.css";

function info(text) {
  return dom.div({ className: "pane-info" }, text);
}

let expandedCache = new Set();
let actorsCache = [];

class Scopes extends PureComponent {
  state: {
    scopes: any
  };

  constructor(props, ...args) {
    const { pauseInfo, selectedFrame } = props;

    super(props, ...args);

    this.state = {
      scopes: getScopes(pauseInfo, selectedFrame)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { pauseInfo, selectedFrame } = this.props;
    const pauseInfoChanged = pauseInfo !== nextProps.pauseInfo;
    const selectedFrameChange = selectedFrame !== nextProps.selectedFrame;

    if (pauseInfoChanged || selectedFrameChange) {
      this.setState({
        scopes: getScopes(nextProps.pauseInfo, nextProps.selectedFrame)
      });
    }
  }

  render() {
    const { pauseInfo, loadObjectProperties, loadedObjects } = this.props;
    const { scopes } = this.state;

    let scopeInspector = info(L10N.getStr("scopes.notAvailable"));
    if (scopes) {
      scopeInspector = ObjectInspector({
        roots: scopes,
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
      });
    }

    return dom.div(
      { className: "pane scopes-list" },
      pauseInfo ? scopeInspector : info(L10N.getStr("scopes.notPaused"))
    );
  }
}

Scopes.propTypes = {
  pauseInfo: ImPropTypes.map,
  loadedObjects: ImPropTypes.map,
  loadObjectProperties: PropTypes.func,
  selectedFrame: PropTypes.object
};

Scopes.displayName = "Scopes";

export default connect(
  state => ({
    pauseInfo: getPause(state),
    selectedFrame: getSelectedFrame(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
