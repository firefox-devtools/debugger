// @flow

import { DOM as dom, PropTypes, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import get from "lodash/get";
import { showMenu } from "devtools-launchpad";
import classNames from "classnames";

import actions from "../../actions";
import { filterDuplicates } from "../../utils/utils";
import { getFilename } from "../../utils/source";
import Svg from "../shared/Svg";

import { getFrames, getSelectedFrame, getSource } from "../../selectors";

import { copyToTheClipboard } from "../../utils/clipboard";
import { formatDisplayName, annotateFrame } from "../../utils/frame";

import type { Frame, Source } from "../../types";

type LocalFrame = Frame & {
  library: string
};

import "./Frames.css";

const NUM_FRAMES_SHOWN = 7;

function renderFrameTitle(frame: Frame) {
  const displayName = formatDisplayName(frame);
  return dom.div({ className: "title" }, displayName);
}

function renderFrameLocation({ source, location, library }: LocalFrame) {
  const thisSource: ?Source = source;
  if (thisSource == null) {
    return;
  }

  if (library) {
    return dom.div(
      { className: "location" },
      library,
      Svg(library.toLowerCase(), { className: "annotation-logo" })
    );
  }

  const filename = getFilename(thisSource);
  return dom.div({ className: "location" }, `${filename}: ${location.line}`);
}

class Frames extends Component {
  state: {
    showAllFrames: boolean
  };

  renderFrame: Function;
  toggleFramesDisplay: Function;

  constructor(...args) {
    super(...args);

    this.state = {
      showAllFrames: false
    };

    this.renderFrame = this.renderFrame.bind(this);
    this.toggleFramesDisplay = this.toggleFramesDisplay.bind(this);
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

  onContextMenu(event: SyntheticKeyboardEvent, frame: Frame) {
    const copySourceUrlLabel = L10N.getStr("copySourceUrl");
    const copySourceUrlKey = L10N.getStr("copySourceUrl.accesskey");

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
  }

  renderFrame(frame: LocalFrame) {
    const { selectedFrame } = this.props;
    return dom.li(
      {
        key: frame.id,
        className: classNames("frame", {
          selected: selectedFrame && selectedFrame.id === frame.id
        }),
        onMouseDown: e => this.onMouseDown(e, frame, selectedFrame),
        onKeyUp: e => this.onKeyUp(e, frame, selectedFrame),
        onContextMenu: e => this.onContextMenu(e, frame),
        tabIndex: 0
      },
      renderFrameTitle(frame),
      renderFrameLocation(frame)
    );
  }

  onMouseDown(e: SyntheticKeyboardEvent, frame: Frame, selectedFrame: Frame) {
    if (e.nativeEvent.which == 3 && selectedFrame.id != frame.id) {
      return;
    }
    this.props.selectFrame(frame);
  }

  onKeyUp(event: SyntheticKeyboardEvent, frame: Frame, selectedFrame: Frame) {
    if (event.key != "Enter" || selectedFrame.id == frame.id) {
      return;
    }
    this.props.selectFrame(frame);
  }

  renderFrames(frames: Frame[]) {
    const numFramesToShow = this.state.showAllFrames
      ? frames.length
      : NUM_FRAMES_SHOWN;

    const framesToShow = frames.slice(0, numFramesToShow);

    return dom.ul({}, framesToShow.map(this.renderFrame));
  }

  renderToggleButton(frames: Frame[]) {
    let buttonMessage = this.state.showAllFrames
      ? L10N.getStr("callStack.collapse")
      : L10N.getStr("callStack.expand");

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

function getSourceForFrame(state, frame) {
  return getSource(state, frame.location.sourceId);
}

function filterFrameworkFrames(frames) {
  return filterDuplicates(
    frames,
    ([prev, item]) => !(prev.library && prev.library == item.library)
  );
}

function appendSource(state, frame) {
  return Object.assign({}, frame, {
    source: getSourceForFrame(state, frame).toJS()
  });
}

function getAndProcessFrames(state) {
  let frames = getFrames(state);
  if (!frames) {
    return null;
  }

  frames = frames
    .toJS()
    .filter(frame => getSourceForFrame(state, frame))
    .filter(frame => !get(frame, "source.isBlackBoxed"))
    .map(frame => appendSource(state, frame))
    .map(annotateFrame);

  frames = filterFrameworkFrames(frames);
  return frames;
}

export default connect(
  state => ({
    frames: getAndProcessFrames(state),
    selectedFrame: getSelectedFrame(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
