// @flow
import { Component } from "react";
import { isEnabled } from "devtools-config";
import ReactDOM from "react-dom";
import { isGeneratedId } from "devtools-source-map";

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
    selectedSource: Object,
    editor: Object
  };

  addBreakpoint: Function;

  constructor() {
    super();
    this.addBreakpoint = this.addBreakpoint.bind(this);
  }

  addBreakpoint() {
    const { breakpoint, selectedSource } = this.props;
    const isGeneratedSource = isGeneratedId(selectedSource.get("id"));

    // NOTE: we need to wait for the breakpoint to be loaded
    // to get the generated location
    if (isGeneratedSource && breakpoint.loading) {
      return;
    }

    const location = isGeneratedSource
      ? breakpoint.generatedLocation
      : breakpoint.location;

    const line = location.line - 1;

    this.props.editor.setGutterMarker(
      line,
      "breakpoints",
      makeMarker(breakpoint.disabled)
    );
    this.props.editor.addLineClass(line, "line", "new-breakpoint");
    if (breakpoint.condition) {
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
