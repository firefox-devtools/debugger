import React, { Component } from "react";
import { DOM as dom, PropTypes } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import {
  getSelectedSource,
  getSourceText,
  getPrettySource,
  getPaneCollapse,
} from "../../selectors";
import Svg from "../shared/Svg";
import ImPropTypes from "react-immutable-proptypes";
import classnames from "classnames";
import { isEnabled } from "devtools-config";
import { isPretty } from "../../utils/source";
import { shouldShowFooter, shouldShowPrettyPrint } from "../../utils/editor";
import _PaneToggleButton from "../shared/Button/PaneToggle";
const PaneToggleButton = React.createFactory(_PaneToggleButton);

import "./Footer.css";

class SourceFooter extends Component {
  constructor() {
    super();
    this.onClickPrettyPrint = this.onClickPrettyPrint.bind(this);
  }

  onClickPrettyPrint() {
    this.props.togglePrettyPrint(this.props.selectedSource.get("id"));
  }

  prettyPrintButton() {
    const { selectedSource, sourceText } = this.props;
    const sourceLoaded = selectedSource &&
      sourceText &&
      !sourceText.get("loading");

    if (!shouldShowPrettyPrint(selectedSource)) {
      return;
    }

    const tooltip = L10N.getStr("sourceFooter.debugBtnTooltip");
    const type = "prettyPrint";

    return dom.button(
      {
        onClick: this.onClickPrettyPrint,
        className: classnames("action", type, {
          active: sourceLoaded,
          pretty: isPretty(selectedSource.toJS()),
        }),
        key: type,
        title: tooltip,
        "aria-label": tooltip,
      },
      Svg(type)
    );
  }

  coverageButton() {
    const { recordCoverage } = this.props;

    if (!isEnabled("codeCoverage")) {
      return;
    }

    return dom.button(
      {
        className: "coverage action",
        title: "Code Coverage",
        onClick: () => recordCoverage(),
        "aria-label": "Code Coverage",
      },
      "C"
    );
  }

  renderToggleButton() {
    if (this.props.horizontal) {
      return;
    }

    return PaneToggleButton({
      position: "end",
      collapsed: !this.props.endPanelCollapsed,
      horizontal: this.props.horizontal,
      handleClick: this.props.togglePaneCollapse,
    });
  }

  renderCommands() {
    const { selectedSource } = this.props;

    if (!shouldShowPrettyPrint(selectedSource)) {
      return null;
    }

    return dom.div(
      { className: "commands" },
      this.prettyPrintButton(),
      this.coverageButton()
    );
  }

  render() {
    const { selectedSource, horizontal } = this.props;

    if (!shouldShowFooter(selectedSource, horizontal)) {
      return null;
    }

    return dom.div(
      { className: "source-footer" },
      this.renderCommands(),
      this.renderToggleButton()
    );
  }
}

SourceFooter.propTypes = {
  selectedSource: ImPropTypes.map,
  togglePrettyPrint: PropTypes.func,
  recordCoverage: PropTypes.func,
  sourceText: ImPropTypes.map,
  selectSource: PropTypes.func,
  prettySource: ImPropTypes.map,
  editor: PropTypes.object,
  endPanelCollapsed: PropTypes.bool,
  togglePaneCollapse: PropTypes.func,
  horizontal: PropTypes.bool,
};

SourceFooter.displayName = "SourceFooter";

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    const selectedId = selectedSource && selectedSource.get("id");
    return {
      selectedSource,
      sourceText: getSourceText(state, selectedId),
      prettySource: getPrettySource(state, selectedId),
      endPanelCollapsed: getPaneCollapse(state, "end"),
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceFooter);
