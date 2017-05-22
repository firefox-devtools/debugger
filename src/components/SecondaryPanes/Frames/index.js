// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { createSelector } from "reselect";

import get from "lodash/get";
import type { Frame } from "debugger-html";
import type { SourcesMap } from "../../../reducers/sources";

import _FrameComponent from "./Frame";
const FrameComponent = createFactory(_FrameComponent);

import _Group from "./Group";
const Group = createFactory(_Group);

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
  getSources
} from "../../../selectors";

import type { LocalFrame } from "./types";

import "./Frames.css";

const NUM_FRAMES_SHOWN = 7;

class Frames extends Component {
  state: {
    showAllFrames: boolean
  };

  collapseFrames(frames) {
    const { frameworkGroupingOn } = this.props;
    if (!frameworkGroupingOn) {
      return frames;
    }

    return collapseFrames(frames);
  }

  renderFrame: Function;
  toggleFramesDisplay: Function;
  copyStackTrace: Function;
  toggleFrameworkGrouping: Function;

  constructor(...args) {
    super(...args);

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

    return dom.ul(
      {},
      framesOrGroups.map(
        (frameOrGroup: FrameOrGroup) =>
          frameOrGroup.id
            ? FrameComponent({
                frame: frameOrGroup,
                toggleFrameworkGrouping: this.toggleFrameworkGrouping,
                copyStackTrace: this.copyStackTrace,
                frameworkGroupingOn,
                selectFrame,
                selectedFrame,
                toggleBlackBox,
                key: frameOrGroup.id
              })
            : Group({
                group: frameOrGroup,
                toggleFrameworkGrouping: this.toggleFrameworkGrouping,
                copyStackTrace: this.copyStackTrace,
                frameworkGroupingOn,
                selectFrame,
                selectedFrame,
                toggleBlackBox,
                key: frameOrGroup[0].id
              })
      )
    );
  }

  renderToggleButton(frames: LocalFrame[]) {
    let buttonMessage = this.state.showAllFrames
      ? L10N.getStr("callStack.collapse")
      : L10N.getStr("callStack.expand");

    frames = collapseFrames(frames);
    if (frames.length < NUM_FRAMES_SHOWN) {
      return null;
    }

    return dom.div(
      { className: "show-more", onClick: this.toggleFramesDisplay },
      buttonMessage
    );
  }

  render() {
    const { frames } = this.props;

    if (!frames) {
      return dom.div(
        { className: "pane frames" },
        dom.div(
          { className: "pane-info empty" },
          L10N.getStr("callStack.notPaused")
        )
      );
    }

    return dom.div(
      { className: "pane frames" },
      this.renderFrames(frames),
      this.renderToggleButton(frames)
    );
  }
}

Frames.propTypes = {
  frames: PropTypes.array,
  frameworkGroupingOn: PropTypes.bool.isRequired,
  toggleFrameworkGrouping: PropTypes.func.isRequired,
  selectedFrame: PropTypes.object,
  selectFrame: PropTypes.func.isRequired,
  toggleBlackBox: PropTypes.func
};

Frames.displayName = "Frames";

function getSourceForFrame(sources, frame) {
  return getSourceInSources(sources, frame.location.sourceId);
}

function appendSource(sources, frame) {
  return Object.assign({}, frame, {
    source: getSourceForFrame(sources, frame).toJS()
  });
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
    selectedFrame: getSelectedFrame(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
