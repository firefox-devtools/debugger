// @flow
import { Component } from "react";
import type { SourceEditor } from "devtools-source-editor";
import type { Frame } from "../../types";

type DebugLineProps = {
  editor: SourceEditor,
  frame: Frame,
  visibleSourceId: string
};

class DebugLine extends Component {
  props: DebugLineProps;

  componentDidUpdate(prevProps: DebugLineProps) {
    const lastFrame = prevProps.frame;
    const lastLine = lastFrame && lastFrame.location.line;
    const nextFrame = this.props.frame;
    const nextLine = nextFrame && nextFrame.location.line;

    if (lastLine && lastLine != nextLine) {
      this.clearDebugLine(lastLine);
    }

    const nextSourceId = nextFrame && nextFrame.location.sourceId;
    const { visibleSourceId } = this.props;

    if (nextLine && nextSourceId === visibleSourceId) {
      this.setDebugLine(nextLine);
    }
  }

  clearDebugLine(line: number) {
    this.props.editor.codeMirror.removeLineClass(
      line - 1,
      "line",
      "new-debug-line"
    );
  }

  setDebugLine(line: number) {
    this.props.editor.codeMirror.addLineClass(
      line - 1,
      "line",
      "new-debug-line"
    );
  }

  render() {
    return null;
  }
}

DebugLine.displayName = "DebugLine";

export default DebugLine;
