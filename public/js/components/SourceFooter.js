const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { isEnabled } = require("../feature");
const { getSelectedSource, getSourceText } = require("../selectors");
const Svg = require("./utils/Svg");
const ImPropTypes = require("react-immutable-proptypes");
const classnames = require("classnames");

function debugBtn(onClick, type, className = "active", tooltip) {
  className = `${type} ${className}`;
  return dom.span(
    { onClick, className, key: type },
    Svg(type, { title: tooltip })
  );
}

const SourceFooter = React.createClass({
  propTypes: {
    selectedSource: ImPropTypes.map.isRequired,
    togglePrettyPrint: PropTypes.func,
    sourceText: ImPropTypes.map.isRequired
  },

  displayName: "Editor",

  blackboxButton() {
    if (!isEnabled("blackbox")) {
      return null;
    }

    return debugBtn(
      () => {},
      "blackBox",
      this.props.selectedSource,
      "Toggle Black Boxing"
    );
  },

  prettyPrintButton() {
    const { selectedSource, sourceText, togglePrettyPrint } = this.props;
    const sourceLoaded = selectedSource && !sourceText.get("loading");

    return debugBtn(
      () => togglePrettyPrint(selectedSource.get("id")),
      "prettyPrint",
      classnames({ active: sourceLoaded }),
      "Prettify Source"
    );
  },

  render() {
    return dom.div({ className: "source-footer" },
      dom.div({ className: "command-bar" },
        this.blackboxButton(),
        this.prettyPrintButton()
      )
    );
  }
});

module.exports = connect(
  state => {
    const selectedSource = getSelectedSource(state);
    const selectedId = selectedSource && selectedSource.get("id");
    return {
      selectedSource,
      sourceText: getSourceText(state, selectedId)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceFooter);
