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
  getGeneratedFrameScope,
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
  generatedFrameScopes: Object,
  frameScopes: Object | null,
  isLoading: boolean,
  hasOriginalScopes: boolean,
  why: Why
};

type State = {
  scopes: ?(NamedValue[]),
  generatedScopes: ?(NamedValue[]),
  showOriginal: boolean
};

class Scopes extends PureComponent<Props, State> {
  constructor(props: Props, ...args) {
    const { why, selectedFrame, frameScopes, generatedFrameScopes } = props;

    super(props, ...args);

    this.state = {
      scopes: getScopes(why, selectedFrame, frameScopes),
      generatedScopes: getScopes(why, selectedFrame, generatedFrameScopes),
      showOriginal: true
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
        ),
        generatedScopes: getScopes(
          nextProps.why,
          nextProps.selectedFrame,
          nextProps.generatedFrameScopes
        )
      });
    }
  }

  render() {
    const { hasOriginalScopes, isPaused, isLoading } = this.props;
    const { scopes, generatedScopes, showOriginal } = this.state;

    if (scopes) {
      return (
        <div className="pane scopes-list">
          <ObjectInspector
            roots={showOriginal ? scopes : generatedScopes}
            autoExpandAll={false}
            autoExpandDepth={1}
            disableWrap={true}
            disabledFocus={true}
            dimTopLevelWindow={true}
            createObjectClient={grip => createObjectClient(grip)}
          />
          {hasOriginalScopes ? (
            <div className="scope-type-toggle">
              <a
                href=""
                onClick={e => {
                  e.preventDefault();
                  this.setState({ showOriginal: !showOriginal });
                }}
              >
                {showOriginal
                  ? L10N.getStr("scopes.toggleToGenerated")
                  : L10N.getStr("scopes.toggleToOriginal")}
              </a>
            </div>
          ) : null}
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
      selectedFrame && selectedFrame.id
    ) || { scope: null, pending: false };

    const {
      scope: generatedFrameScopes,
      pending: generatedPending
    } = getGeneratedFrameScope(state, selectedFrame && selectedFrame.id) || {
      scope: null,
      pending: false
    };

    const isLoading = generatedPending || pending;

    return {
      selectedFrame,
      isPaused: getIsPaused(state),
      isLoading,
      why: getPauseReason(state),
      frameScopes,
      generatedFrameScopes,
      hasOriginalScopes:
        isLoading || !generatedFrameScopes || !frameScopes
          ? false
          : generatedFrameScopes.actor !== frameScopes.actor
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
