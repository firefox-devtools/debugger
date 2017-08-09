// @flow
import React, { PropTypes, PureComponent } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";
import {
  getSelectedFrame,
  getLoadedObjects,
  getFrameScopes,
  getPause
} from "../../selectors";
import { getScopes } from "../../utils/scopes";

import ObjectInspector from "../shared/ObjectInspector";

import "./Scopes.css";

function info(text) {
  return (
    <div className="pane-info">
      {text}
    </div>
  );
}
info.displayName = "paneInfo";

class Scopes extends PureComponent {
  state: {
    scopes: any
  };

  constructor(props, ...args) {
    const { pauseInfo, selectedFrame, frameScopes } = props;

    super(props, ...args);

    this.state = {
      scopes: getScopes(pauseInfo, selectedFrame, frameScopes)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { pauseInfo, selectedFrame } = this.props;
    const pauseInfoChanged = pauseInfo !== nextProps.pauseInfo;
    const selectedFrameChange = selectedFrame !== nextProps.selectedFrame;

    if (pauseInfoChanged || selectedFrameChange) {
      this.setState({
        scopes: getScopes(
          nextProps.pauseInfo,
          nextProps.selectedFrame,
          nextProps.frameScopes
        )
      });
    }
  }

  render() {
    const { pauseInfo, loadObjectProperties, loadedObjects } = this.props;
    const { scopes } = this.state;

    let scopeInspector = info(L10N.getStr("scopes.notAvailable"));
    if (scopes) {
      scopeInspector = (
        <ObjectInspector
          roots={scopes}
          getObjectProperties={id => loadedObjects[id]}
          loadObjectProperties={loadObjectProperties}
        />
      );
    }
    return (
      <div className="pane scopes-list">
        {pauseInfo ? scopeInspector : info(L10N.getStr("scopes.notPaused"))}
      </div>
    );
  }
}

Scopes.propTypes = {
  pauseInfo: PropTypes.object,
  loadedObjects: PropTypes.object,
  loadObjectProperties: PropTypes.func,
  selectedFrame: PropTypes.object,
  frameScopes: PropTypes.object
};

Scopes.displayName = "Scopes";

export default connect(
  state => {
    const selectedFrame = getSelectedFrame(state);
    const frameScopes = selectedFrame
      ? getFrameScopes(state, selectedFrame.id)
      : null;
    return {
      selectedFrame,
      pauseInfo: getPause(state),
      frameScopes: frameScopes,
      loadedObjects: getLoadedObjects(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
