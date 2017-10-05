// @flow
import { Component } from "react";
import { markText, toEditorPosition } from "../../utils/editor";
import { getDocument } from "../../utils/editor/source-documents";

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
    const { selectedLocation } = this.props;

    if (!getDocument(nextProps.selectedLocation.sourceId)) {
      console.log(`uhoh ${nextProps.selectedLocation.sourceId}`);
    }
    //
    // if (!selectedLocation || !nextProps.selectedLocation) {
    //   console.log(
    //     `bail early ${selectedLocation.line} -> ${nextProps.selectedLocation
    //       .line}`
    //   );
    //   return false;
    // }

    // if (selectedLocation.line === nextProps.selectedLocation.line) {
    //   console.log(
    //     `bail early ${selectedLocation.line} -> ${nextProps.selectedLocation
    //       .line}`
    //   );
    // }

    if (selectedLocation !== nextProps.selectedLocation) {
      console.log(
        `SL ${selectedLocation.line} -> ${nextProps.selectedLocation.line}`
      );
    }

    return (
      selectedLocation.sourceId != nextProps.selectedLocation.sourceId ||
      selectedLocation.line != nextProps.selectedLocation.line
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
