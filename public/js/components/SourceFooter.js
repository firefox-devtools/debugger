const React = require("react");
const { DOM: dom, PropTypes } = React;
const { findDOMNode } = require("react-dom");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { isEnabled } = require("devtools-config");
const { getSelectedSource, getSourceText, getPrettySource } = require("../selectors");
const Svg = require("./utils/Svg");
const ImPropTypes = require("react-immutable-proptypes");
const classnames = require("classnames");
const { isOriginalId } = require("../utils/source-map");
const { isPretty } = require("../utils/source");
const { find, findNext, findPrev } = require("../utils/source-search");

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

  onClickPrettyPrint() {
    this.props.togglePrettyPrint(this.props.selectedSource.get("id"));
  },

  prettyPrintButton() {
    const { selectedSource, sourceText } = this.props;
    const sourceLoaded = selectedSource && !sourceText.get("loading");

    if (isOriginalId(selectedSource.get("id")) ||
        (isOriginalId(selectedSource.get("id")) &&
         !isPretty(selectedSource.toJS()))) {
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

  onKeyUp(e) {
    const query = e.target.value;
    const ed = this.props.editor;
    const ctx = { ed, cm: ed.codeMirror };

    if (e.key != "Enter") {
      find(ctx, query);
    } else if (e.shiftKey) {
      findPrev(ctx, query);
    } else {
      findNext(ctx, query);
    }
  },

  focusSearch(shortcut, e) {
    e.stopPropagation();
    e.preventDefault();
    const node = findDOMNode(this).querySelector(".source-search");
    node.focus();
  },

  render() {
    if (!this.props.selectedSource ||
        (!isEnabled("prettyPrint") && !isEnabled("blackBox"))) {
      return dom.div({ className: "source-footer" });
    }

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
      sourceText: getSourceText(state, selectedId),
      prettySource: getPrettySource(state, selectedId)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceFooter);
