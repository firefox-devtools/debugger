// @flow
import React, { PureComponent } from "react";
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

import { ObjectInspector } from "devtools-reps";
import type { Pause, LoadedObject } from "debugger-html";

import "./Scopes.css";

type Props = {
  pauseInfo: Pause,
  loadedObjects: LoadedObject[],
  loadObjectProperties: Object => void,
  selectedFrame: Object,
  frameScopes: Object
};

class Scopes extends PureComponent {
  props: Props;
  state: {
    scopes: any
  };

  constructor(props: Props, ...args) {
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

    if (scopes) {
      return (
        <div className="pane scopes-list">
          <ObjectInspector
            roots={scopes}
            autoExpandDepth={1}
            getObjectProperties={id => loadedObjects[id]}
            loadObjectProperties={loadObjectProperties}
            disableWrap={true}
            disabledFocus={true}
            dimTopLevelWindow={true}
            // TODO: See https://github.com/devtools-html/debugger.html/issues/3555.
            getObjectEntries={actor => {}}
            loadObjectEntries={grip => {}}
          />
        </div>
      );
    }
    return (
      <div className="pane scopes-list">
        <div className="pane-info">
          {pauseInfo
            ? L10N.getStr("scopes.notAvailable")
            : L10N.getStr("scopes.notPaused")}
        </div>
      </div>
    );
  }
}

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
