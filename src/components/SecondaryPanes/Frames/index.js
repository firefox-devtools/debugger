// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { createSelector } from "reselect";

// NOTE: using require because `import get` breaks atom's syntax highlighting
const get = require("lodash/get");

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

  renderFrame: Function;
  toggleFramesDisplay: Function;
  copyStackTrace: Function;

  constructor(...args) {
    super(...args);

    this.state = {
      showAllFrames: false
    };

    this.toggleFramesDisplay = this.toggleFramesDisplay.bind(this);
    this.copyStackTrace = this.copyStackTrace.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { frames, selectedFrame } = this.props;
    const { showAllFrames } = this.state;
    return (
      frames !== nextProps.frames ||
      selectedFrame !== nextProps.selectedFrame ||
      showAllFrames !== nextState.showAllFrames
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

  renderFrames(frames: LocalFrame[]) {
    const { selectFrame, selectedFrame } = this.props;

    const framesOrGroups = this.truncateFrames(collapseFrames(frames));
    type FrameOrGroup = LocalFrame | LocalFrame[];

    return dom.ul(
      {},
      framesOrGroups.map(
        (frameOrGroup: FrameOrGroup) =>
          frameOrGroup.id
            ? FrameComponent({
                frame: frameOrGroup,
                copyStackTrace: this.copyStackTrace,
                frames,
                selectFrame,
                selectedFrame,
                key: frameOrGroup.id
              })
            : Group({
                group: frameOrGroup,
                copyStackTrace: this.copyStackTrace,
                selectFrame,
                selectedFrame,
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
  selectedFrame: PropTypes.object,
  selectFrame: PropTypes.func.isRequired
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

const getAndProcessFrames = createSelector(
  getFrames,
  getSources,
  (frames, sources) => {
    if (!frames) {
      return null;
    }

    frames = frames
      .toJS()
      .filter(frame => getSourceForFrame(sources, frame))
      .filter(frame => !get(frame, "source.isBlackBoxed"))
      .map(frame => appendSource(sources, frame))
      .map(annotateFrame);

    return frames;
  }
);

export default connect(
  state => ({
    frames: getAndProcessFrames(state),
    selectedFrame: getSelectedFrame(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
