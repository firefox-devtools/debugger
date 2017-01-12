const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause, getIsWaitingOnBreak } = require("../selectors");
const Svg = require("./utils/Svg");
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

function debugBtn(onClick, type, tooltip) {
  const className = `${type} active`;
  return dom.span(
    { onClick, className, key: type },
    Svg(type, { title: tooltip })
  );
}

const CommandBar = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectedSource: PropTypes.object,
    resume: PropTypes.func,
    stepIn: PropTypes.func,
    stepOut: PropTypes.func,
    stepOver: PropTypes.func,
    breakOnNext: PropTypes.func,
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
    return [
      debugBtn(this.props.resume, "resume",
        L10N.getFormatStr("resumeButtonTooltip", formatKey("resume"))
      ),
      debugBtn(this.props.stepOver, "stepOver",
        L10N.getFormatStr("stepOverTooltip", formatKey("stepOver"))
      ),
      debugBtn(this.props.stepIn, "stepIn",
        L10N.getFormatStr("stepInTooltip", formatKey("stepIn"))
      ),
      debugBtn(this.props.stepOut, "stepOut",
        L10N.getFormatStr("stepOutTooltip", formatKey("stepOut"))
      )
    ];
  },

  render() {
    return (
      this.props.pause ?
      dom.div(
        { className: "command-bar" },
        this.renderStepButtons(),
      ) : null
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
