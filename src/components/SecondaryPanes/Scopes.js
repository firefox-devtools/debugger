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
  getSelectedFrame,
  getFrameScope,
  isPaused as getIsPaused,
  getPauseReason
} from "../../selectors";
import { getScopes } from "../../utils/pause/scopes";

import { ObjectInspector } from "devtools-reps";
import type { Pause, Why } from "debugger-html";
import type { NamedValue } from "../../utils/pause/scopes/types";

import "./Scopes.css";

type Props = {
  isPaused: Pause,
  selectedFrame: Object,
  frameScopes: Object,
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
    const { isPaused } = this.props;
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
    return (
      <div className="pane scopes-list">
        <div className="pane-info">
          {isPaused
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
      ? getFrameScope(state, selectedFrame.id)
      : null;
    return {
      selectedFrame,
      isPaused: getIsPaused(state),
      why: getPauseReason(state),
      frameScopes: frameScopes
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
