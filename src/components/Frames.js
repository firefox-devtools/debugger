// @flow
const React = require("react");
const { DOM: dom, PropTypes } = React;
const { div } = dom;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { endTruncateStr } = require("../utils/utils");
const { getFilename } = require("../utils/source");
const { getFrames, getSelectedFrame, getSource } = require("../selectors");
const classNames = require("classnames");

import type { List } from "immutable";
import type { Frame } from "../types";

if (typeof window == "object") {
  require("./Frames.css");
}

const NUM_FRAMES_SHOWN = 7;

function renderFrameTitle({ displayName }: Frame) {
  return div({ className: "title" }, endTruncateStr(displayName, 40));
}

function renderFrameLocation({ source, location }: Frame) {
  const filename = getFilename(source);
  return div(
    { className: "location" },
    `${filename}: ${location.line}`
  );
}

const Frames = React.createClass({
  propTypes: {
    frames: ImPropTypes.list,
    selectedFrame: PropTypes.object,
    selectFrame: PropTypes.func.isRequired
  },

  displayName: "Frames",

  getInitialState() {
    return { showAllFrames: false };
  },

  toggleFramesDisplay() {
    this.setState({
      showAllFrames: !this.state.showAllFrames
    });
  },

  renderFrame(frame: Frame) {
    const { selectedFrame, selectFrame } = this.props;

    return dom.li(
      { key: frame.id,
        className: classNames("frame", {
          "selected": selectedFrame && selectedFrame.id === frame.id
        }),
        onMouseDown: () => selectFrame(frame),
        tabIndex: 0
      },
      renderFrameTitle(frame),
      renderFrameLocation(frame)
    );
  },

  renderFrames(frames: List<Frame>) {
    const numFramesToShow =
      this.state.showAllFrames ? frames.size : NUM_FRAMES_SHOWN;
    const framesToShow = frames.slice(0, numFramesToShow);

    return dom.ul({}, framesToShow.map(this.renderFrame));
  },

  renderToggleButton(frames: List<Frame>) {
    let buttonMessage = this.state.showAllFrames
      ? L10N.getStr("callStack.collapse") : L10N.getStr("callStack.expand");

    if (frames.size < NUM_FRAMES_SHOWN) {
      return null;
    }

    return dom.div(
      { className: "show-more", onClick: this.toggleFramesDisplay },
      buttonMessage
    );
  },

  render() {
    const { frames } = this.props;

    if (!frames) {
      return div(
        { className: "pane frames" },
        div(
          { className: "pane-info empty" },
          L10N.getStr("callStack.notPaused")
        )
      );
    }

    return div(
      { className: "pane frames" },
      this.renderFrames(frames),
      this.renderToggleButton(frames)
    );
  }
});

function getAndProcessFrames(state) {
  const frames = getFrames(state);
  if (!frames) {
    return null;
  }
  return frames.filter(frame => getSource(state, frame.location.sourceId))
               .map(frame => Object.assign({}, frame, {
                 source: getSource(state, frame.location.sourceId).toJS()
               }));
}

module.exports = connect(
  state => ({
    frames: getAndProcessFrames(state),
    selectedFrame: getSelectedFrame(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
