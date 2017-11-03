/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { createSelector } from "reselect";

import { get } from "lodash";
import type { Frame } from "debugger-html";
import type { SourcesMap } from "../../../reducers/sources";

import FrameComponent from "./Frame";
import Group from "./Group";

import renderWhyPaused from "./WhyPaused";

import actions from "../../../actions";
import {
  annotateFrame,
  collapseFrames,
  formatCopyName
} from "../../../utils/frame";
import { copyToTheClipboard } from "../../../utils/clipboard";

import {
  getFrames,
  getFrameworkGroupingState,
  getSelectedFrame,
  getSourceInSources,
  getSources,
  getPause
} from "../../../selectors";

import type { LocalFrame } from "./types";

import "./Frames.css";

const NUM_FRAMES_SHOWN = 7;

type Props = {
  frames: Array<Frame>,
  frameworkGroupingOn: boolean,
  toggleFrameworkGrouping: Function,
  selectedFrame: Object,
  selectFrame: Function,
  toggleBlackBox: Function,
  pause: Object
};

type State = {
  showAllFrames: boolean
};

class Frames extends Component<Props, State> {
  renderFrames: Function;
  toggleFramesDisplay: Function;
  truncateFrames: Function;
  copyStackTrace: Function;
  toggleFrameworkGrouping: Function;
  renderToggleButton: Function;

  constructor(props) {
    super(props);

    this.state = {
      showAllFrames: false
    };

    this.toggleFramesDisplay = this.toggleFramesDisplay.bind(this);
    this.copyStackTrace = this.copyStackTrace.bind(this);
    this.toggleFrameworkGrouping = this.toggleFrameworkGrouping.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { frames, selectedFrame, frameworkGroupingOn } = this.props;
    const { showAllFrames } = this.state;
    return (
      frames !== nextProps.frames ||
      selectedFrame !== nextProps.selectedFrame ||
      showAllFrames !== nextState.showAllFrames ||
      frameworkGroupingOn !== nextProps.frameworkGroupingOn
    );
  }

  toggleFramesDisplay() {
    this.setState({
      showAllFrames: !this.state.showAllFrames
    });
  }

  collapseFrames(frames) {
    const { frameworkGroupingOn } = this.props;
    if (!frameworkGroupingOn) {
      return frames;
    }

    return collapseFrames(frames);
  }

  truncateFrames(frames) {
    const numFramesToShow = this.state.showAllFrames
      ? frames.length
      : NUM_FRAMES_SHOWN;

    return frames.slice(0, numFramesToShow);
  }

  copyStackTrace() {
    const { frames } = this.props;
    const framesToCopy = frames.map(f => formatCopyName(f)).join("\n");
    copyToTheClipboard(framesToCopy);
  }

  toggleFrameworkGrouping() {
    const { toggleFrameworkGrouping, frameworkGroupingOn } = this.props;
    toggleFrameworkGrouping(!frameworkGroupingOn);
  }

  renderFrames(frames: LocalFrame[]) {
    const {
      selectFrame,
      selectedFrame,
      toggleBlackBox,
      frameworkGroupingOn
    } = this.props;

    const framesOrGroups = this.truncateFrames(this.collapseFrames(frames));
    type FrameOrGroup = LocalFrame | LocalFrame[];

    return (
      <ul>
        {framesOrGroups.map(
          (frameOrGroup: FrameOrGroup) =>
            frameOrGroup.id ? (
              <FrameComponent
                frame={frameOrGroup}
                toggleFrameworkGrouping={this.toggleFrameworkGrouping}
                copyStackTrace={this.copyStackTrace}
                frameworkGroupingOn={frameworkGroupingOn}
                selectFrame={selectFrame}
                selectedFrame={selectedFrame}
                toggleBlackBox={toggleBlackBox}
                key={String(frameOrGroup.id)}
              />
            ) : (
              <Group
                group={frameOrGroup}
                toggleFrameworkGrouping={this.toggleFrameworkGrouping}
                copyStackTrace={this.copyStackTrace}
                frameworkGroupingOn={frameworkGroupingOn}
                selectFrame={selectFrame}
                selectedFrame={selectedFrame}
                toggleBlackBox={toggleBlackBox}
                key={frameOrGroup[0].id}
              />
            )
        )}
      </ul>
    );
  }

  renderToggleButton(frames: LocalFrame[]) {
    const buttonMessage = this.state.showAllFrames
      ? L10N.getStr("callStack.collapse")
      : L10N.getStr("callStack.expand");

    frames = this.collapseFrames(frames);
    if (frames.length <= NUM_FRAMES_SHOWN) {
      return null;
    }

    return (
      <div className="show-more" onClick={this.toggleFramesDisplay}>
        {buttonMessage}
      </div>
    );
  }

  render() {
    const { frames, pause } = this.props;

    if (!frames) {
      return (
        <div className="pane frames">
          <div className="pane-info empty">
            {L10N.getStr("callStack.notPaused")}
          </div>
        </div>
      );
    }

    return (
      <div className="pane frames">
        {this.renderFrames(frames)}
        {renderWhyPaused({ pause })}
        {this.renderToggleButton(frames)}
      </div>
    );
  }
}

Frames.propTypes = {
  frames: PropTypes.array,
  frameworkGroupingOn: PropTypes.bool.isRequired,
  toggleFrameworkGrouping: PropTypes.func.isRequired,
  selectedFrame: PropTypes.object,
  selectFrame: PropTypes.func.isRequired,
  toggleBlackBox: PropTypes.func,
  pause: PropTypes.object
};

function getSourceForFrame(sources, frame) {
  return getSourceInSources(sources, frame.location.sourceId);
}

function appendSource(sources, frame) {
  return { ...frame, source: getSourceForFrame(sources, frame).toJS() };
}

export function getAndProcessFrames(frames: Frame[], sources: SourcesMap) {
  if (!frames) {
    return null;
  }

  const processedFrames = frames
    .filter(frame => getSourceForFrame(sources, frame))
    .map(frame => appendSource(sources, frame))
    .filter(frame => !get(frame, "source.isBlackBoxed"))
    .map(annotateFrame);

  return processedFrames;
}

const getAndProcessFramesSelector = createSelector(
  getFrames,
  getSources,
  getAndProcessFrames
);

export default connect(
  state => ({
    frames: getAndProcessFramesSelector(state),
    frameworkGroupingOn: getFrameworkGroupingState(state),
    selectedFrame: getSelectedFrame(state),
    pause: getPause(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
