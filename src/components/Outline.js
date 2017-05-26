// @flow

import { DOM as dom, PropTypes, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";
import actions from "../actions";
import { getSelectedSource, getSymbols } from "../selectors";
import { isEnabled } from "devtools-config";
import "./Outline.css";
import previewFunction from "./shared/previewFunction";

import type { Record } from "../utils/makeRecord";
import type { SourceText } from "debugger-html";

class Outline extends Component {
  state: any;

  constructor(props) {
    super(props);
    const { sourceText, isHidden } = props;
    this.state = {};
  }

  selectItem(location) {
    const { selectedSource, selectSource } = this.props;
    const selectedSourceId = selectedSource.get("id");
    const startLine = location.start.line;
    selectSource(selectedSourceId, { line: startLine });
  }

  renderFunction(func) {
    return dom.li(
      {
        key: func.id,
        className: "outline-list__element",
        onClick: () => this.selectItem(func.location)
      },
      previewFunction(func)
    );
  }

  renderFunctions() {
    const { symbols } = this.props;

    return symbols.functions
      .filter(func => func.name != "anonymous")
      .map(func => this.renderFunction(func));
  }

  render() {
    const { isHidden } = this.props;
    if (!isEnabled("outline")) {
      return null;
    }

    return dom.div(
      { className: classnames("outline", { hidden: isHidden }) },
      dom.ul({ className: "outline-list" }, this.renderFunctions())
    );
  }
}

Outline.propTypes = {
  isHidden: PropTypes.bool.isRequired,
  selectSource: PropTypes.func.isRequired,
  selectedSource: PropTypes.object
};

Outline.displayName = "Outline";

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    return {
      symbols: getSymbols(state, selectedSource.toJS()),
      selectedSource
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Outline);
