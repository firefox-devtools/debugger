// @flow
import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import CloseButton from "../shared/Button/Close";
import "./ConditionalPanel.css";
import { toEditorLine } from "../../utils/editor";
import actions from "../../actions";

import {
  getSelectedLocation,
  getBreakpointForLine,
  getConditionalPanelLine
} from "../../selectors";

type Props = {
  breakpoint: Object,
  selectedLocation: Object,
  setBreakpointCondition: Function,
  line: number,
  editor: Object,
  openConditionalPanel: () => void,
  closeConditionalPanel: () => void
};

export class ConditionalPanel extends PureComponent<Props> {
  cbPanel: null | Object;
  input: Object;

  constructor() {
    super();
    this.cbPanel = null;
    this.input = {};
  }

  setInput = (node: Object) => {
    this.input = node;
  };

  saveAndClose = () => {
    if (this.input) {
      this.setBreakpoint(this.input.value);
    }

    this.props.closeConditionalPanel();
  };

  onKey = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      this.saveAndClose();
    } else if (e.key === "Escape") {
      this.props.closeConditionalPanel();
    }
  };

  setBreakpoint(condition: string) {
    const { selectedLocation, line } = this.props;
    const sourceId = selectedLocation ? selectedLocation.sourceId : "";
    const location = { sourceId, line };
    return this.props.setBreakpointCondition(location, { condition });
  }

  clearConditionalPanel() {
    if (this.cbPanel) {
      this.cbPanel.clear();
      this.cbPanel = null;
    }
  }

  componentWillUpdate(nextProps: Props) {
    if (nextProps.line) {
      return this.renderToWidget(nextProps);
    }
    return this.clearConditionalPanel();
  }

  renderToWidget(props: Props) {
    const { selectedLocation, line, editor } = props;
    const sourceId = selectedLocation ? selectedLocation.sourceId : "";

    const editorLine = toEditorLine(sourceId, line);
    this.cbPanel = editor.codeMirror.addLineWidget(
      editorLine,
      this.renderConditionalPanel(props),
      {
        coverGutter: true,
        noHScroll: false
      }
    );
    this.input.focus();
  }

  renderConditionalPanel(props: Props) {
    const { breakpoint } = props;
    const condition = breakpoint ? breakpoint.condition : "";
    const panel = document.createElement("div");
    ReactDOM.render(
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
      </div>,
      panel
    );
    return panel;
  }

  render() {
    return null;
  }
}

export default connect(
  state => {
    const line = getConditionalPanelLine(state);
    const selectedLocation = getSelectedLocation(state);
    return {
      selectedLocation,
      breakpoint: getBreakpointForLine(state, selectedLocation.sourceId, line),
      line
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(ConditionalPanel);
