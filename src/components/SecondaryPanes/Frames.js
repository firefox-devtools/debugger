// @flow

import {
  DOM as dom, PropTypes, createClass
} from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ImPropTypes from "react-immutable-proptypes";
import actions from "../../actions";
import { endTruncateStr } from "../../utils/utils";
import { getFilename } from "../../utils/source";
import { getFrames, getSelectedFrame, getSource } from "../../selectors";
import { showMenu } from "../shared/menu";
import { isEnabled } from "devtools-config";
import { copyToTheClipboard } from "../../utils/clipboard";
import classNames from "classnames";

import type { List } from "immutable";
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
    frames: ImPropTypes.list,
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

  getInitialState() {
    return { showAllFrames: false };
  },

  toggleFramesDisplay() {
    this.setState({
      showAllFrames: !this.state.showAllFrames
    });
  },

  onContextMenu(event, frame) {
    event.stopPropagation();
    event.preventDefault();

    const source = frame.source;

    const menuOptions = [];

    if (source) {
      const copySourceUrl = {
        id: "node-menu-copy-source",
        label: "Copy Source URL",
        accesskey: "X",
        disabled: false,
        click: () => copyToTheClipboard(source.url)
      };

      if (isEnabled("copySource")) {
        menuOptions.push(copySourceUrl);
      }      
    }

    showMenu(event, menuOptions);
  },

  renderFrame(frame: Frame) {
    const { selectedFrame, selectFrame } = this.props;

    return dom.li(
      { key: frame.id,
        className: classNames("frame", {
          "selected": selectedFrame && selectedFrame.id === frame.id
        }),
        onMouseDown: (e) => this.onMouseDown(e, frame, selectedFrame),
        onContextMenu: (e) => this.onContextMenu(e, frame),
        tabIndex: 0
      },
      renderFrameTitle(frame),
      renderFrameLocation(frame)
    );
  },

  onMouseDown(e, frame, selectedFrame) {
    if (e.nativeEvent.which == 3 
        && selectedFrame
        && selectedFrame.id != frame.id) {
      return;
    }
    this.props.selectFrame(frame);
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

export default connect(
  state => ({
    frames: getAndProcessFrames(state),
    selectedFrame: getSelectedFrame(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
