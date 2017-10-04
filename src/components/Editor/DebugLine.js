// @flow
import { Component } from "react";
import { markText, toEditorPosition } from "../../utils/editor";
import { getDocument } from "../../utils/editor/source-documents";

type props = {
  editor: Object,
  selectedFrame: Object,
  selectedLocation: Object,
  pauseData: Object
};

export default class DebugLine extends Component {
  props: props;
  state: {
    debugExpression: {
      clear: Function
    }
  };

  constructor() {
    super();
    this.state = { debugExpression: { clear: () => {} } };
  }

  componentWillMount() {
    this.setDebugLine(
      this.props.selectedFrame,
      this.props.selectedLocation,
      this.props.editor,
      this.props.pauseData
    );
  }

  componentWillReceiveProps(nextProps: props) {
    this.clearDebugLine(
      this.props.selectedFrame,
      this.props.editor,
      this.props.pauseData
    );
    this.setDebugLine(
      nextProps.selectedFrame,
      nextProps.selectedLocation,
      nextProps.editor,
      nextProps.pauseData
    );
  }

  componentWillUnmount() {
    this.clearDebugLine(
      this.props.selectedFrame,
      this.props.editor,
      this.props.pauseData
    );
  }

  setDebugLine(
    selectedFrame: Object,
    selectedLocation: Object,
    editor: Object,
    pauseData: Object
  ) {
    const { location, location: { sourceId } } = selectedFrame;
    const { line, column } = toEditorPosition(sourceId, location);

    const doc = getDocument(sourceId);
    if (!doc) {
      return;
    }

    if (pauseData && pauseData.why.type === "exception") {
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

  clearDebugLine(selectedFrame: Object, editor: Object, pauseData: Object) {
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
    if (pauseData && pauseData.why.type === "exception") {
      doc.removeLineClass(editorLine, "line", "new-debug-line-error");
    } else {
      doc.removeLineClass(editorLine, "line", "new-debug-line");
    }
  }

  render() {
    return null;
  }
}
