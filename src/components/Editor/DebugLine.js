// @flow
import { PureComponent } from "react";

type DebugLineProps = {
  codeMirror: any,
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
    this.props.codeMirror.removeLineClass(line - 1, "line", "new-debug-line");
  }

  setDebugLine(line: number) {
    this.props.codeMirror.addLineClass(line - 1, "line", "new-debug-line");
  }

  render() {
    return null;
  }
}

DebugLine.displayName = "DebugLine";

export default DebugLine;
