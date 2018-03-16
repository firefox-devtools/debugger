/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import "./ConditionalPanel.css";
import { toEditorLine } from "../../utils/monaco";
import actions from "../../actions";

import {
  getSelectedLocation,
  getBreakpointForLine,
  getConditionalPanelLine
} from "../../selectors";

type Props = {
  breakpoint: ?Object,
  selectedLocation: Object,
  setBreakpointCondition: Function,
  line: number,
  editor: Object,
  openConditionalPanel: () => void,
  closeConditionalPanel: () => void
};

const WIDGET_ID = "editor.contrib.zoneWidget";

export class ConditionalPanel extends PureComponent<Props> {
  input: ?HTMLInputElement;
  panelNode: ?HTMLDivElement;
  panel: ?HTMLDivElement;
  expressionViewZone: number;
  expressionOverlay: any;

  constructor() {
    super();
    this.panel = null;
    this.expressionViewZone = -1;
    this.expressionOverlay = null;
  }

  keepFocusOnInput() {
    if (this.input) {
      this.input.focus();
    }
  }

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
    const { editor } = this.props;
    if (this.expressionOverlay !== null) {
      editor.monaco.removeOverlayWidget(this.expressionOverlay);
      this.expressionOverlay = null;
    }
    if (this.expressionViewZone >= 0) {
      editor.monaco.changeViewZones(accessor => {
        accessor.removeZone(this.expressionViewZone);
        this.expressionViewZone = -1;
      });
    }
  }

  componentWillMount() {
    if (this.props.line) {
      return this.renderToWidget(this.props);
    }
  }

  componentWillUpdate(nextProps: Props) {
    if (nextProps.line) {
      return this.renderToWidget(nextProps);
    }
    return this.clearConditionalPanel();
  }

  componentDidUpdate(prevProps: Props) {
    this.keepFocusOnInput();
  }

  componentWillUnmount() {
    // This is called if CodeMirror is re-initializing itself before the
    // user closes the conditional panel. Clear the widget, and re-render it
    // as soon as this component gets remounted
    return this.clearConditionalPanel();
  }

  renderToWidget(props: Props) {
    if (this.cbPanel) {
      if (this.props.line && this.props.line == props.line) {
        return props.closeConditionalPanel();
      }
      this.clearConditionalPanel();
    }

    const { selectedLocation, line, editor } = props;
    const sourceId = selectedLocation ? selectedLocation.sourceId : "";

    const editorLine = toEditorLine(sourceId, line);
    const viewZone = document.createElement("div");
    if (this.panel === null) {
      this.panel = this.renderConditionalPanel(props);
    }
    editor.monaco.changeViewZones(accessor => {
      this.expressionViewZone = accessor.addZone({
        afterLineNumber: editorLine,
        heightInPx: 45,
        domNode: viewZone,
        onDomNodeTop: top => {
          if (this.panel) {
            this.panel.style.top = `${top}px`;
            this.panel.style.width = "100%";
          }
        }
      });

      this.expressionOverlay = {
        getId: () => {
          return WIDGET_ID + this.expressionViewZone;
        },
        getDomNode: () => {
          return this.panel;
        },
        getPosition: () => {
          return null;
        }
      };

      editor.monaco.addOverlayWidget(this.expressionOverlay);
    });
  }

  renderConditionalPanel(props: Props) {
    const { breakpoint } = props;
    const condition = breakpoint ? breakpoint.condition : "";
    const panel = document.createElement("div");
    ReactDOM.render(
      <div
        className="conditional-breakpoint-panel"
        onClick={() => this.keepFocusOnInput()}
        onBlur={this.props.closeConditionalPanel}
        ref={node => (this.panelNode = node)}
      >
        <div className="prompt">»</div>
        <input
          defaultValue={condition}
          placeholder={L10N.getStr("editor.conditionalPanel.placeholder")}
          onKeyDown={this.onKey}
          ref={input => {
            this.input = input;
            this.keepFocusOnInput();
          }}
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

const {
  setBreakpointCondition,
  openConditionalPanel,
  closeConditionalPanel
} = actions;

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
  {
    setBreakpointCondition,
    openConditionalPanel,
    closeConditionalPanel
  }
)(ConditionalPanel);
