// @flow
import { PureComponent } from "react";
import { getDocument } from "../../utils/editor";

type DebugLineProps = {
  sourceId: string,
  line: number
};

class DebugLine extends PureComponent {
  props: DebugLineProps;

  componentDidUpdate(prevProps: DebugLineProps) {
    this.clearDebugLine(prevProps.line);
    this.setDebugLine(this.props.line);
  }

  componentDidMount() {
    this.setDebugLine(this.props.line);
  }

  componentWillUnmount() {
    this.clearDebugLine(this.props.line);
  }

  clearDebugLine(line: number) {
    getDocument(this.props.sourceId).removeLineClass(
      line - 1,
      "line",
      "new-debug-line"
    );
  }

  setDebugLine(line: number) {
    getDocument(this.props.sourceId).addLineClass(
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
