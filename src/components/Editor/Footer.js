const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../../actions");
const { getSelectedSource, getSourceText,
        getPrettySource, getPaneCollapse } = require("../../selectors");
const Svg = require("../shared/Svg");
const ImPropTypes = require("react-immutable-proptypes");
const classnames = require("classnames");
const { isEnabled } = require("devtools-config");
const { isPretty } = require("../../utils/source");
const {
  shouldShowFooter,
  shouldShowPrettyPrint
} = require("../../utils/editor");
const PaneToggleButton = React.createFactory(
  require("../shared/Button/PaneToggle").default
);

require("./Footer.css");

const SourceFooter = React.createClass({
  propTypes: {
    selectedSource: ImPropTypes.map,
    togglePrettyPrint: PropTypes.func,
    recordCoverage: PropTypes.func,
    sourceText: ImPropTypes.map,
    selectSource: PropTypes.func,
    prettySource: ImPropTypes.map,
    editor: PropTypes.object,
    endPanelCollapsed: PropTypes.bool,
    togglePaneCollapse: PropTypes.func,
    horizontal: PropTypes.bool
  },

  displayName: "SourceFooter",

  onClickPrettyPrint() {
    this.props.togglePrettyPrint(this.props.selectedSource.get("id"));
  },

  prettyPrintButton() {
    const { selectedSource, sourceText } = this.props;
    const sourceLoaded = selectedSource && sourceText &&
    !sourceText.get("loading");

    if (!shouldShowPrettyPrint(selectedSource)) {
      return;
    }

    const tooltip = L10N.getStr("sourceFooter.debugBtnTooltip");
    const type = "prettyPrint";

    return dom.button({
      onClick: this.onClickPrettyPrint,
      className: classnames("action", type, {
        active: sourceLoaded,
        pretty: isPretty(selectedSource.toJS())
      }),
      key: type,
      title: tooltip,
      "aria-label": tooltip
    },
      Svg(type)
    );
  },

  coverageButton() {
    const { recordCoverage } = this.props;

    if (!isEnabled("codeCoverage")) {
      return;
    }

    return dom.button({
      className: "coverage action",
      title: "Code Coverage",
      onClick: () => recordCoverage(),
      "aria-label": "Code Coverage"
    }, "C");
  },

  renderToggleButton() {
    if (this.props.horizontal) {
      return;
    }

    return PaneToggleButton({
      position: "end",
      collapsed: !this.props.endPanelCollapsed,
      horizontal: this.props.horizontal,
      handleClick: this.props.togglePaneCollapse
    });
  },

  renderCommands() {
    const { selectedSource } = this.props;

    if (!shouldShowPrettyPrint(selectedSource)) {
      return null;
    }

    return dom.div({ className: "commands" },
      this.prettyPrintButton(),
      this.coverageButton()
    );
  },

  render() {
    const { selectedSource, horizontal } = this.props;

    if (!shouldShowFooter(selectedSource, horizontal)) {
      return null;
    }

    return dom.div({ className: "source-footer" },
      this.renderCommands(),
      this.renderToggleButton()
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
      prettySource: getPrettySource(state, selectedId),
      endPanelCollapsed: getPaneCollapse(state, "end")
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceFooter);
