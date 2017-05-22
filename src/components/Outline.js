// @flow

import { DOM as dom, PropTypes, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";
import actions from "../actions";
import { getSelectedSource, getSourceText } from "../selectors";
import { isEnabled } from "devtools-config";
import { getSymbols } from "../utils/parser";
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
    if (!isHidden) {
      this.setSymbolDeclarations(sourceText);
    }
  }

  componentWillReceiveProps({ sourceText }) {
    if (sourceText) {
      this.setSymbolDeclarations(sourceText);
    }
  }

  // TODO: move this logic out of the component and into a reducer
  async setSymbolDeclarations(sourceText: Record<SourceText>) {
    const symbolDeclarations = await getSymbols(sourceText.toJS());

    if (symbolDeclarations !== this.state.symbolDeclarations) {
      this.setState({
        symbolDeclarations
      });
    }
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
    const { symbolDeclarations } = this.state;
    if (!symbolDeclarations) {
      return;
    }

    const { functions } = symbolDeclarations;

    return functions
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
  sourceText: PropTypes.object,
  selectSource: PropTypes.func.isRequired,
  selectedSource: PropTypes.object
};

Outline.displayName = "Outline";

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    const sourceId = selectedSource ? selectedSource.get("id") : null;
    return {
      sourceText: getSourceText(state, sourceId),
      selectedSource
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Outline);
