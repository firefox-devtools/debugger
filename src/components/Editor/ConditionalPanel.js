// @flow
import React from "react";
import ReactDOM from "react-dom";

import CloseButton from "../shared/Button/Close";
import "./ConditionalPanel.css";
import { toEditorLine } from "../../utils/editor";

export class ConditionalPanel {
  constructor() {
    super();
    this.state = {
      cbPanel: null
    };
    this.input = null;
  }

  setInput = (node) => {
    this.input = node;
  };

  saveAndClose = () => {
    if (this.input) {
      this.setBreakpoint(this.input.value);
    }

    this.props.closeConditionalPanel();
  };

  onKey = (e: SyntheticKeyboardEvent) => {
    if (e.key === "Enter") {
      this.saveAndClose();
    } else if (e.key === "Escape") {
      this.props.closeConditionalPanel();
    }
  };

  setBreakpoint(condition) {
    return this.props.setBreakpointCondition(location, { condition })
  }

  clearConditionalPanel() {
    this.state.cbPanel.clear();
    this.setState({ cbPanel: null });
  }

  componentWillUpdate(nextProps) {
    if (nextProps.conditionalPanelLine) {
      return this.renderToWidget(nextProps);
    }
    return this.clearConditionalPanel();
  }

  renderToWidget(props) {
    const { selectedLocation, conditionalPanelLine, editor } = props;
    const sourceId = selectedLocation ? selectedLocation.sourceId : "";
    const line = conditionalPanelLine;

    const editorLine = toEditorLine(sourceId, line);
    const cbPanel = editor.codeMirror.addLineWidget(
      editorLine,
      this.renderConditionalPanel(),
      {
        coverGutter: true,
        noHScroll: false
      }
    );
    this.input.focus()
    this.setState({ cbPanel });
  }

  renderConditionalPanel() {
    const breakpoint = this.props.breakpoint;
    const condition = breakpoint ? breakpoint.condition : "";
    return (
      <div className="conditional-breakpoint-panel">
        <div className="prompt">»</div>
        <input
          defaultValue={condition}
          placeholder={L10N.getStr("editor.conditionalPanel.placeholder")}
          onKeyDown={this.onKey}
          ref={this.setInput}
        />
        <CloseButton
          handleClick={this.props.closeConditionalPanel}
          buttonClass="big"
          tooltip={L10N.getStr("editor.conditionalPanel.close")}
        />
      </div>
    );
  }

  render() {
    return null;
  }
}

ConditionalPanel.propTypes = {
  breakpoint: ImPropTypes.map,
  selectedLocation: PropTypes.object,
  selectedSource: ImPropTypes.map,
  setBreakpointCondition: PropTypes.func,
  conditionalPanelLine: PropTypes.number,
  openConditionalBreakpointPanel: PropTypes.func,
  closeConditionalBreakpointPanel: PropTypes.func
};


export default connect(
  state => {
    return {
      selectedLocation: getSelectedLocation(state),
      selectedSource: getSelectedSource(state),
      breakpoints: getBreakpointForLine(state, line),
      conditionalPanelLine: getConditionalPanelLine(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(ConditionalPanel);
