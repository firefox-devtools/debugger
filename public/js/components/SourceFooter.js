const React = require("react");
const { DOM: dom, PropTypes } = React;
const { findDOMNode } = require("react-dom");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { getSelectedSource, getSourceText, getPrettySource } = require("../selectors");
const Svg = require("./utils/Svg");
const ImPropTypes = require("react-immutable-proptypes");
const classnames = require("classnames");
const { isPretty } = require("../utils/source");
const { shouldShowFooter, shouldShowPrettyPrint } = require("../utils/editor");

require("./SourceFooter.css");

function debugBtn(onClick, type, className = "active", tooltip) {
  className = `${type} ${className}`;
  return dom.span(
    { onClick, className, key: type },
    Svg(type, { title: tooltip })
  );
}

const SourceFooter = React.createClass({
  propTypes: {
    selectedSource: ImPropTypes.map,
    togglePrettyPrint: PropTypes.func,
    sourceText: ImPropTypes.map,
    selectSource: PropTypes.func,
    prettySource: ImPropTypes.map,
    editor: PropTypes.object,
  },

  displayName: "SourceFooter",

  onClickPrettyPrint() {
    this.props.togglePrettyPrint(this.props.selectedSource.get("id"));
  },

  prettyPrintButton() {
    const { selectedSource, sourceText } = this.props;
    const sourceLoaded = selectedSource && !sourceText.get("loading");

    if (!shouldShowPrettyPrint(selectedSource.toJS())) {
      return;
    }

    return debugBtn(
      this.onClickPrettyPrint,
      "prettyPrint",
      classnames({
        active: sourceLoaded,
        pretty: isPretty(selectedSource.toJS())
      }),
      "Prettify Source"
    );
  },

  focusSearch(shortcut, e) {
    e.stopPropagation();
    e.preventDefault();
    const node = findDOMNode(this).querySelector(".source-search");
    node.focus();
  },

  render() {
    const { selectedSource } = this.props;

    if (!selectedSource || !shouldShowFooter(selectedSource.toJS())) {
      return null;
    }

    return dom.div({ className: "source-footer" },
      dom.div({ className: "command-bar" },
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
      sourceText: getSourceText(state, selectedId),
      prettySource: getPrettySource(state, selectedId)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceFooter);
