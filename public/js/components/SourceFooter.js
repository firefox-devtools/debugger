const React = require("react");
const { DOM: dom, PropTypes } = React;
const { findDOMNode } = require("react-dom");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { isEnabled } = require("../feature");
const { getSelectedSource, getSourceText, getPrettySource } = require("../selectors");
const Svg = require("./utils/Svg");
const ImPropTypes = require("react-immutable-proptypes");
const classnames = require("classnames");
const { isMapped, getGeneratedSourceId,
        isOriginal } = require("../utils/source-map");
const { isPretty } = require("../utils/source");
const { find, findNext, findPrev } = require("../utils/source-search");
const { getShortcuts } = require("../utils/shortcuts");

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
    const { selectedSource, togglePrettyPrint,
            selectSource, prettySource } = this.props;

    if (isPretty(selectedSource.toJS())) {
      return selectSource(getGeneratedSourceId(selectedSource.toJS()));
    }

    if (selectedSource.get("isPrettyPrinted")) {
      return selectSource(prettySource.get("id"));
    }

    togglePrettyPrint(selectedSource.get("id"));
  },

  prettyPrintButton() {
    const { selectedSource, sourceText } = this.props;
    const sourceLoaded = selectedSource && !sourceText.get("loading");

    if (isMapped(selectedSource.toJS()) ||
      (isOriginal(selectedSource.toJS()) && !isPretty(selectedSource.toJS()))) {
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

  setupKeyboardShortcuts() {
    if (this.keyShortcutsEnabled) {
      return;
    }

    this.keyShortcutsEnabled = true;
    const shortcuts = getShortcuts();
    shortcuts.on("Cmd+f", this.focusSearch);
  },

  componentWillUnmount() {
    const shortcuts = getShortcuts();
    shortcuts.off("Cmd+f", this.focusSearch);
  },

  componentDidUpdate() {
    this.setupKeyboardShortcuts();
  },

  render() {
    if (!this.props.selectedSource ||
        (!isEnabled("prettyPrint")
          && !isEnabled("blackBox")
          && !isEnabled("search"))) {
      return dom.div({ className: "source-footer" });
    }

    return dom.div({ className: "source-footer" },
      dom.input({
        className: "source-search",
        onKeyUp: (e) => this.onKeyUp(e)
      }),
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
