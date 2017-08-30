// @flow
import { Component } from "react";
import { markText, toEditorPosition } from "../../utils/editor";
import { getDocument } from "../../utils/editor/source-documents";

type Props = {
  editor: Object,
  selectedFrame: Object,
  selectedLocation: Object
};

type State = {
  debugExpression: {
    clear: Function
  }
};

export default class DebugLine extends Component<> {
  static defaultProps: Props;
  constructor() {
    super();
    this.state = { debugExpression: { clear: () => {} } };
  }

  componentWillMount() {
    this.setDebugLine(
      this.props.selectedFrame,
      this.props.selectedLocation,
      this.props.editor
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    this.clearDebugLine(this.props.selectedFrame, this.props.editor);
    this.setDebugLine(
      nextProps.selectedFrame,
      nextProps.selectedLocation,
      nextProps.editor
    );
  }

  componentWillUnmount() {
    this.clearDebugLine(this.props.selectedFrame, this.props.editor);
  }

  setDebugLine(
    selectedFrame: Object,
    selectedLocation: Object,
    editor: Object
  ) {
    const { location, location: { sourceId } } = selectedFrame;
    const { line, column } = toEditorPosition(sourceId, location);

    const doc = getDocument(sourceId);
    if (!doc) {
      return;
    }

    doc.addLineClass(line, "line", "new-debug-line");
    const debugExpression = markText(editor, "debug-expression", {
      start: { line, column },
      end: { line, column: null }
    });
    this.setState({ debugExpression });
  }

  clearDebugLine(selectedFrame: Object, editor: Object) {
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
  }

  render() {
    return null;
  }
}

DebugLine.displayName = "DebugLine";
