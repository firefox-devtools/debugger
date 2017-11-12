/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { Component } from "react";
import { markText, toEditorPosition } from "../../utils/editor";
import { getDocument } from "../../utils/editor/source-documents";

import { connect } from "react-redux";
import {
  getSelectedLocation,
  getSelectedFrame,
  getPause
} from "../../selectors";

type Props = {
  editor: Object,
  selectedFrame: Object,
  selectedLocation: Object,
  pauseInfo: Object
};

type State = {
  debugExpression: {
    clear: Function
  }
};

type TextClasses = {
  markTextClass: string,
  lineClass: string
};
export class DebugLine extends Component<Props, State> {
  constructor() {
    super();
    this.state = { debugExpression: { clear: () => {} } };
  }

  componentDidMount() {
    this.setDebugLine(
      this.props.pauseInfo,
      this.props.selectedFrame,
      this.props.selectedLocation,
      this.props.editor
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    this.clearDebugLine(this.props.selectedFrame, this.props.editor);
    this.setDebugLine(
      nextProps.pauseInfo,
      nextProps.selectedFrame,
      nextProps.selectedLocation,
      nextProps.editor
    );
  }

  componentWillUnmount() {
    this.clearDebugLine(this.props.selectedFrame, this.props.editor);
  }

  setDebugLine(
    pauseInfo: Object,
    selectedFrame: Object,
    selectedLocation: Object,
    editor: Object
  ) {
    if (!selectedFrame) {
      return;
    }

    const { location, location: { sourceId } } = selectedFrame;
    const doc = getDocument(sourceId);
    if (!doc) {
      return;
    }

    const { line, column } = toEditorPosition(sourceId, location);

    // make sure the line is visible
    if (editor && editor.alignLine) {
      editor.alignLine(line);
    }

    const { markTextClass, lineClass } = this.getTextClasses(pauseInfo);
    doc.addLineClass(line, "line", lineClass);

    const debugExpression = markText(editor, markTextClass, {
      start: { line, column },
      end: { line, column: null }
    });
    this.setState({ debugExpression });
  }

  clearDebugLine(selectedFrame: Object, editor: Object) {
    if (!selectedFrame) {
      return;
    }
    const { line, sourceId } = selectedFrame.location;
    const { debugExpression } = this.state;
    if (debugExpression) {
      debugExpression.clear();
    }

    const editorLine = line - 1;
    const doc = getDocument(sourceId);
    if (!doc) {
      return;
    }

    doc.removeLineClass(editorLine, "line", "new-debug-line");
    doc.removeLineClass(editorLine, "line", "new-debug-line-error");
  }

  getTextClasses(pauseInfo: Object): TextClasses {
    if (pauseInfo && pauseInfo.why.type === "exception") {
      return {
        markTextClass: "debug-expression-error",
        lineClass: "new-debug-line-error"
      };
    }
    return { markTextClass: "debug-expression", lineClass: "new-debug-line" };
  }

  render() {
    return null;
  }
}

export default connect(state => ({
  selectedLocation: getSelectedLocation(state),
  selectedFrame: getSelectedFrame(state),
  pauseInfo: getPause(state)
}))(DebugLine);
