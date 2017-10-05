// @flow
import { Component } from "react";
import { markText, toEditorPosition } from "../../utils/editor";
import { getDocument } from "../../utils/editor/source-documents";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getSelectedLocation, getSelectedFrame } from "../../selectors";

type props = {
  editor: Object,
  selectedFrame: Object,
  selectedLocation: Object
};

export class DebugLine extends Component {
  props: props;
  debugExpression: null;

  constructor() {
    super();
  }

  shouldComponentUpdate(nextProps: props) {
    const { selectedLocation } = this.props;

    return (
      nextProps.selectedFrame &&
      (selectedLocation.sourceId != nextProps.selectedLocation.sourceId ||
        selectedLocation.line != nextProps.selectedLocation.line)
    );
  }

  componentDidUpdate(prevProps: props) {
    this.clearDebugLine(prevProps.selectedFrame, prevProps.editor);
    this.setDebugLine(
      this.props.selectedFrame,
      this.props.selectedLocation,
      this.props.editor
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
    if (!selectedFrame) {
      return;
    }
    const { location, location: { sourceId } } = selectedFrame;
    const { line, column } = toEditorPosition(sourceId, location);

    const doc = getDocument(sourceId);

    console.log("setDebugLine", sourceId);
    doc.addLineClass(line, "line", "new-debug-line");
    this.debugExpression = markText(editor, "debug-expression", {
      start: { line, column },
      end: { line, column: null }
    });
  }

  clearDebugLine(selectedFrame: Object, editor: Object) {
    if (!selectedFrame) {
      return;
    }

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

export default connect(state => {
  const selectedLocation = getSelectedLocation(state);

  return {
    selectedLocation,
    selectedFrame: getSelectedFrame(state)
  };
})(DebugLine);
