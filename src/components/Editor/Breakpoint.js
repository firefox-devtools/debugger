// @flow
import { Component } from "react";
import { isEnabled } from "devtools-config";
import ReactDOM from "../../../node_modules/react-dom/dist/react-dom";

import classnames from "classnames";
import Svg from "../shared/Svg";

const breakpointSvg = document.createElement("div");
ReactDOM.render(Svg("breakpoint"), breakpointSvg);

function makeMarker(isDisabled: boolean) {
  const bp = breakpointSvg.cloneNode(true);
  bp.className = classnames("editor new-breakpoint", {
    "breakpoint-disabled": isDisabled,
    "folding-enabled": isEnabled("codeFolding")
  });

  return bp;
}

class Breakpoint extends Component {
  props: {
    breakpoint: Object,
    editor: Object
  };

  addBreakpoint: Function;

  constructor() {
    super();
    this.addBreakpoint = this.addBreakpoint.bind(this);
  }

  addBreakpoint() {
    const bp = this.props.breakpoint;
    const line = bp.location.line - 1;

    this.props.editor.setGutterMarker(
      line,
      "breakpoints",
      makeMarker(bp.disabled)
    );
    this.props.editor.addLineClass(line, "line", "new-breakpoint");
    if (bp.condition) {
      this.props.editor.addLineClass(line, "line", "has-condition");
    } else {
      this.props.editor.removeLineClass(line, "line", "has-condition");
    }
  }
  shouldComponentUpdate(nextProps: any) {
    return (
      this.props.editor !== nextProps.editor ||
      this.props.breakpoint.disabled !== nextProps.breakpoint.disabled ||
      this.props.breakpoint.condition !== nextProps.breakpoint.condition
    );
  }
  componentDidMount() {
    if (!this.props.editor) {
      return;
    }

    this.addBreakpoint();
  }
  componentDidUpdate() {
    this.addBreakpoint();
  }
  componentWillUnmount() {
    if (!this.props.editor) {
      return;
    }

    const bp = this.props.breakpoint;
    const line = bp.location.line - 1;

    this.props.editor.setGutterMarker(line, "breakpoints", null);
    this.props.editor.removeLineClass(line, "line", "new-breakpoint");
    this.props.editor.removeLineClass(line, "line", "has-condition");
  }
  render() {
    return null;
  }
}

Breakpoint.displayName = "Breakpoint";

export default Breakpoint;
