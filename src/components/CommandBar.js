const React = require("react");
const { PropTypes } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause, getIsWaitingOnBreak } = require("../selectors");
const ImPropTypes = require("react-immutable-proptypes");
const { formatKeyShortcut } = require("../utils/text");

const { Services: { appinfo }} = require("devtools-modules");

const actions = require("../actions");
require("./CommandBar.css");

const isMacOS = (appinfo.OS === "Darwin");

const COMMANDS = ["resume", "stepOver", "stepIn", "stepOut"];

const KEYS = {
  "WINNT": {
    "resume": "F8",
    "pause": "F8",
    "stepOver": "F10",
    "stepIn": "F11",
    "stepOut": "Shift+F11"
  },
  "Darwin": {
    "resume": "Cmd+\\",
    "pause": "Cmd+\\",
    "stepOver": "Cmd+'",
    "stepIn": "Cmd+;",
    "stepOut": "Cmd+Shift+:",
    "stepOutDisplay": "Cmd+Shift+;"
  },
  "Linux": {
    "resume": "F8",
    "pause": "F8",
    "stepOver": "F10",
    "stepIn": "Ctrl+F11",
    "stepOut": "Ctrl+Shift+F11"
  }
};

function getKey(action) {
  return getKeyForOS(appinfo.OS, action);
}

function getKeyForOS(os, action) {
  return KEYS[os][action];
}

function formatKey(action) {
  const key = getKey(`${action}Display`) || getKey(action);
  if (isMacOS) {
    const winKey = getKeyForOS("WINNT", `${action}Display`) ||
                   getKeyForOS("WINNT", action);
    // display both Windows type and Mac specific keys
    return formatKeyShortcut([key, winKey].join(" "));
  }
  return formatKeyShortcut(key);
}

function debugBtn(item) {
  const className = `${item.type} active`;
  return (
    <span onClick={item.action} key={item.type}>
      <Svg className={className} name={item.type} title={item.label} />
    </span>
  );
}

debugBtn.displayName = "debugButton";

const CommandBar = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectedSource: PropTypes.object,
    resume: PropTypes.func,
    stepIn: PropTypes.func,
    stepOut: PropTypes.func,
    stepOver: PropTypes.func,
    pause: ImPropTypes.map,
    isWaitingOnBreak: PropTypes.bool,
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  displayName: "CommandBar",

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    COMMANDS.forEach((action) => shortcuts.off(getKey(action)));
    if (isMacOS) {
      COMMANDS.forEach((action) => shortcuts.off(getKeyForOS("WINNT", action)));
    }
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    const handleEvent = (e, func) => {
      e.preventDefault();
      e.stopPropagation();
      func();
    };

    COMMANDS.forEach((action) => shortcuts.on(
      getKey(action),
      (_, e) => handleEvent(e, this.props[action]))
    );

    if (isMacOS) {
      // The Mac supports both the Windows Function keys
      // as well as the Mac non-Function keys
      COMMANDS.forEach((action) => shortcuts.on(
        getKeyForOS("WINNT", action),
        (_, e) => handleEvent(e, this.props[action]))
      );
    }
  },

  renderStepButtons() {
    const buttons = [
      {
        action: this.props.resume,
        type: "resume",
        label: L10N.getFormatStr("resumeButtonTooltip", formatKey("resume")),
      },
      {
        action: this.props.stepOver,
        type: "stepOver",
        label: L10N.getFormatStr("stepOverTooltip", formatKey("stepOver")),
      },
      {
        action: this.props.stepIn,
        type: "stepIn",
        label: L10N.getFormatStr("stepInTooltip", formatKey("stepIn")),
      },
      {
        action: this.props.stepOut,
        type: "stepOut",
        label: L10N.getFormatStr("stepOutTooltip", formatKey("stepOut")),
      },
    ];
    return buttons.map(debugBtn);
  },

  render() {
    return (
      this.props.pause ?
        (<div className="command-bar">
          {this.renderStepButtons()}
        </div>) : null
    );
  }
});

module.exports = connect(
  state => {
    return {
      pause: getPause(state),
      isWaitingOnBreak: getIsWaitingOnBreak(state),
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(CommandBar);
