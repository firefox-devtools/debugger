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

function renderFrame(frame, selectedFrame, selectFrame) {
  const selectedClass = (
    selectedFrame && (selectedFrame.id === frame.id ? "selected" : "")
  );

  return dom.li(
    { key: frame.id,
      className: `frame ${selectedClass}`,
      onClick: () => selectFrame(frame) },
    renderFrameTitle(frame),
    renderFrameLocation(frame)
  );
}

const Frames = React.createClass({
  propTypes: {
    frames: ImPropTypes.list.isRequired,
    selectedFrame: PropTypes.object.isRequired,
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

  render() {
    const { frames, selectedFrame, selectFrame } = this.props;
    const numFramesToShow = this.state.showAllFrames ? frames.length : 7;
    let framesDisplay;

    if (frames.length === 0) {
      framesDisplay = div({ className: "pane-info empty" }, "Not Paused");
    } else if (frames.length < numFramesToShow) {
      framesDisplay = dom.ul(null, frames.map(frame => {
        return renderFrame(frame, selectedFrame, selectFrame);
      }));
    } else {
      let frameClass = "hideFrames";
      let buttonMessage = this.state.showAllFrames ?
                          "Collapse Rows" : "Expand Rows";

      framesDisplay = dom.ul({ className: frameClass },
        frames.map(frame => {
          return renderFrame(frame, selectedFrame, selectFrame);
        }).slice(0, numFramesToShow),
        dom.div({
          className: "show-more",
          onClick: this.toggleFramesDisplay
        }, buttonMessage)
      );
    }

    return div(
      { className: "pane frames" },
      framesDisplay
    );
  }
});

module.exports = connect(
  state => ({
    frames: getFrames(state)
      .filter(frame => getSource(state, frame.location.sourceId))
      .map(frame => {
        return Object.assign({}, frame, {
          source: getSource(state, frame.location.sourceId).toJS()
        });
      }),
    selectedFrame: getSelectedFrame(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Frames);
