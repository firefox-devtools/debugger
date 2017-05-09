// @flow

import { DOM as dom, PropTypes, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
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
    this.state = {};
  }

  componentWillReceiveProps({ sourceText }) {
    if (sourceText) {
      this.setSymbolDeclarations(sourceText);
    }
  }

  async setSymbolDeclarations(sourceText: Record<SourceText>) {
    const symbolDeclarations = await getSymbols(sourceText.toJS());

    if (symbolDeclarations !== this.state.symbolDeclarations) {
      this.setState({
        symbolDeclarations
      });
    }
  }

  renderFunction(func) {
    return dom.li(
      {
        key: func.id,
        className: "outline-list__element"
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
      .filter(func => func.value != "anonymous")
      .map(this.renderFunction);
  }

  render() {
    if (!isEnabled("outline")) {
      return null;
    }

    return dom.div(
      { className: "outline" },
      dom.ul({ className: "outline-list" }, this.renderFunctions())
    );
  }
}

Outline.propTypes = {
  selectedSource: PropTypes.object
};

Outline.displayName = "Outline";

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    const sourceId = selectedSource ? selectedSource.get("id") : null;

    return {
      sourceText: getSourceText(state, sourceId)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Outline);
