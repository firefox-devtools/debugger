// @flow

import {
  DOM as dom, PropTypes, createClass
} from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";
import { endTruncateStr } from "../../utils/utils";
import { getFilename } from "../../utils/source";

const { getFrames, getSelectedFrame, getSource } = require("../../selectors");

import { showMenu } from "../shared/menu";
import { copyToTheClipboard } from "../../utils/clipboard";
import classNames from "classnames";

import type { Frame, Source } from "../../types";

import "./Frames.css";

const NUM_FRAMES_SHOWN = 7;

function renderFrameTitle({ displayName }: Frame) {
  return dom.div({ className: "title" }, endTruncateStr(displayName, 40));
}

function renderFrameLocation({ source, location }: Frame) {
  const thisSource : ?Source = source;
  if (thisSource == null) {
    return;
  }

  const filename = getFilename(thisSource);
  return dom.div(
    { className: "location" },
    `${filename}: ${location.line}`
  );
}

const Frames = createClass({
  propTypes: {
    frames: PropTypes.array,
    selectedFrame: PropTypes.object,
    selectFrame: PropTypes.func.isRequired
  },

  displayName: "Frames",

  shouldComponentUpdate(nextProps, nextState) {
    const { frames, selectedFrame } = this.props;
    const { showAllFrames } = this.state;
    return frames !== nextProps.frames
      || selectedFrame !== nextProps.selectedFrame
      || showAllFrames !== nextState.showAllFrames;
  },

  componentWillMount() {
    document.addEventListener("keyup", this.onKeyUp, false);
  },

  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyUp, false);
  },

  getInitialState() {
    return { showAllFrames: false };
  },

  toggleFramesDisplay() {
    this.setState({
      showAllFrames: !this.state.showAllFrames
    });
  },

  onContextMenu(event: SyntheticKeyboardEvent, frame: Frame) {
    const copySourceUrlLabel = L10N.getStr("copySourceUrl");
    const copySourceUrlKey = L10N.getStr("copySourceUrl.accessKey");

    event.stopPropagation();
    event.preventDefault();

    const menuOptions = [];

    const source = frame.source;
    if (source) {
      const copySourceUrl = {
        id: "node-menu-copy-source",
        label: copySourceUrlLabel,
        accesskey: copySourceUrlKey,
        disabled: false,
        click: () => copyToTheClipboard(source.url)
      };

      menuOptions.push(copySourceUrl);
    }

    showMenu(event, menuOptions);
  },

  onMouseEnter(frame: Frame) {
    this.setState({ hoveredFrame: frame });
  },

  onMouseLeave() {
    this.setState({ hoveredFrame: null });
  },

  onKeyUp(event: SyntheticKeyboardEvent) {
    let frames = this.props.frames;
    let newFrame = frames.find(frame => frame.id == this.state.hoveredFrame.id);

    if (newFrame && event.key == "Enter") {
      this.props.selectFrame(newFrame);
    }
  },

  renderFrame(frame: Frame) {
    const { selectedFrame } = this.props;

    return dom.li(
      { key: frame.id,
        className: classNames("frame", {
          "selected": selectedFrame && selectedFrame.id === frame.id
        }),
        onMouseDown: (e) => this.onMouseDown(e, frame, selectedFrame),
        onContextMenu: (e) => this.onContextMenu(e, frame),
        onMouseEnter: () => this.onMouseEnter(frame),
        onMouseLeave: () => this.onMouseLeave(),
        tabIndex: 0
      },
      renderFrameTitle(frame),
      renderFrameLocation(frame)
    );
  },

  onMouseDown(e: SyntheticKeyboardEvent, frame: Frame, selectedFrame: Frame) {
    if (e.nativeEvent.which == 3 && selectedFrame.id != frame.id) {
      return;
    }
    this.props.selectFrame(frame);
  },

  renderFrames(frames: Frame[]) {
    const numFramesToShow =
      this.state.showAllFrames ? frames.length : NUM_FRAMES_SHOWN;
    const framesToShow = frames.slice(0, numFramesToShow);

    return dom.ul({}, framesToShow.map(this.renderFrame));
  },

  renderToggleButton(frames: Frame[]) {
    let buttonMessage = this.state.showAllFrames
      ? L10N.getStr("callStack.collapse") : L10N.getStr("callStack.expand");

    if (frames.length < NUM_FRAMES_SHOWN) {
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
});

function getSourceForFrame(state, frame) {
  return getSource(state, frame.location.sourceId);
}

function getAndProcessFrames(state) {
  const frames = getFrames(state);
  if (!frames) {
    return null;
  }

  return frames
    .toJS()
    .filter(frame => getSourceForFrame(state, frame))
    .map(frame => Object.assign({}, frame, {
      source: getSourceForFrame(state, frame).toJS()
    }));
}

export default connect(
  state => ({
    frames: getAndProcessFrames(state),
    selectedFrame: getSelectedFrame(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
