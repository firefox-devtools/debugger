/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";
import { createObjectClient } from "../../client/firefox";

import {
  getSelectedSource,
  getSelectedFrame,
  getFrameScope,
  isPaused as getIsPaused,
  getPauseReason
} from "../../selectors";
import { getScopes } from "../../utils/pause/scopes";

import { ObjectInspector } from "devtools-reps";
import type { Pause, Why } from "../../types";
import type { NamedValue } from "../../utils/pause/scopes/types";

import "./Scopes.css";

type Props = {
  isPaused: Pause,
  selectedFrame: Object,
  frameScopes: Object | null,
  isLoading: boolean,
  why: Why
};

type State = {
  scopes: ?(NamedValue[])
};

class Scopes extends PureComponent<Props, State> {
  constructor(props: Props, ...args) {
    const { why, selectedFrame, frameScopes } = props;

    super(props, ...args);

    this.state = {
      scopes: getScopes(why, selectedFrame, frameScopes)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { isPaused, selectedFrame, frameScopes } = this.props;
    const isPausedChanged = isPaused !== nextProps.isPaused;
    const selectedFrameChanged = selectedFrame !== nextProps.selectedFrame;
    const frameScopesChanged = frameScopes !== nextProps.frameScopes;

    if (isPausedChanged || selectedFrameChanged || frameScopesChanged) {
      this.setState({
        scopes: getScopes(
          nextProps.why,
          nextProps.selectedFrame,
          nextProps.frameScopes
        )
      });
    }
  }

  render() {
    const { isPaused, isLoading } = this.props;
    const { scopes } = this.state;

    if (scopes) {
      return (
        <div className="pane scopes-list">
          <ObjectInspector
            roots={scopes}
            autoExpandAll={false}
            autoExpandDepth={1}
            disableWrap={true}
            disabledFocus={true}
            dimTopLevelWindow={true}
            createObjectClient={grip => createObjectClient(grip)}
          />
        </div>
      );
    }

    let stateText = L10N.getStr("scopes.notPaused");
    if (isPaused) {
      if (isLoading) {
        stateText = L10N.getStr("loadingText");
      } else {
        stateText = L10N.getStr("scopes.notAvailable");
      }
    }

    return (
      <div className="pane scopes-list">
        <div className="pane-info">{stateText}</div>
      </div>
    );
  }
}

export default connect(
  state => {
    const selectedFrame = getSelectedFrame(state);
    const selectedSource = getSelectedSource(state);

    const { scope: frameScopes, pending } = getFrameScope(
      state,
      selectedSource && selectedSource.get("id"),
      selectedFrame.id
    ) || { scope: null, pending: false };

    return {
      selectedFrame,
      isPaused: getIsPaused(state),
      isLoading: pending,
      why: getPauseReason(state),
      frameScopes: frameScopes
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
