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

    if (pauseInfo && pauseInfo.why.type === "exception") {
      doc.addLineClass(line, "line", "new-debug-line-error");
      const debugExpression = markText(editor, "debug-expression-error", {
        start: { line, column },
        end: { line, column: null }
      });
      this.setState({ debugExpression });
    } else {
      doc.addLineClass(line, "line", "new-debug-line");

      const debugExpression = markText(editor, "debug-expression", {
        start: { line, column },
        end: { line, column: null }
      });
      this.setState({ debugExpression });
    }
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

    // if (pauseInfo && pauseInfo.why.type === "exception") {
    // }

    doc.removeLineClass(editorLine, "line", "new-debug-line");
    doc.removeLineClass(editorLine, "line", "new-debug-line-error");
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
