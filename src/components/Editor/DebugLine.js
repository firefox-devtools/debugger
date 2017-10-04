// @flow
import { Component } from "react";
import { markText, toEditorPosition } from "../../utils/editor";
import { getDocument } from "../../utils/editor/source-documents";
import onIdle from "on-idle";

type props = {
  editor: Object,
  selectedFrame: Object,
  selectedLocation: Object
};

export default class DebugLine extends Component {
  props: props;
  debugExpression: null;

  constructor() {
    super();
  }

  componentWillMount() {
    this.setDebugLine(
      this.props.selectedFrame,
      this.props.selectedLocation,
      this.props.editor
    );
  }

  shouldComponentUpdate(nextProps: props) {
    const { selectedFrame } = this.props;

    return (
      selectedFrame.sourceId != nextProps.selectedFrame.sourceId ||
      selectedFrame.location.line != nextProps.selectedFrame.location.line
    );
  }

  componentDidUpdate(nextProps: props) {
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
    this.debugExpression = markText(editor, "debug-expression", {
      start: { line, column },
      end: { line, column: null }
    });
  }

  clearDebugLine(selectedFrame: Object, editor: Object) {
    const { line, sourceId } = selectedFrame.location;
    if (this.debugExpression) {
      this.debugExpression.clear();
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
