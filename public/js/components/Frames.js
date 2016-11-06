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

if (typeof window == "object") {
  require("./Frames.css");
}

const NUM_FRAMES_SHOWN = 7;

function renderFrameTitle(frame) {
  return div({ className: "title" }, endTruncateStr(frame.displayName, 40));
}

function renderFrameLocation(frame) {
  const filename = getFilename(frame.source);
  return div(
    { className: "location" },
    `${filename}: ${frame.location.line}`
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

  renderFrame(frame) {
    const { selectedFrame, selectFrame } = this.props;

    const selectedClass = (
      selectedFrame && (selectedFrame.id === frame.id ? "selected" : "")
    );

    return dom.li(
      { key: frame.id,
        className: `frame ${selectedClass}`,
        onMouseDown: () => selectFrame(frame),
        tabIndex: 0
      },
      renderFrameTitle(frame),
      renderFrameLocation(frame)
    );
  },

  renderFrames() {
    let { frames } = this.props;
    if (!frames) {
      return null;
    }

    const numFramesToShow = this.state.showAllFrames
      ? frames.size : NUM_FRAMES_SHOWN;
    frames = frames.slice(0, numFramesToShow);

    return dom.ul({}, frames.map(frame => this.renderFrame(frame)));
  },

  renderToggleButton() {
    const { frames } = this.props;
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
      this.renderFrames(),
      this.renderToggleButton()
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
