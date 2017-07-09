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

  isGeneratedSource() {
    return isGeneratedId(this.props.selectedSource.get("id"));
  }

  getLocation() {
    const { breakpoint } = this.props;
    return this.isGeneratedSource()
      ? breakpoint.generatedLocation
      : breakpoint.location;
  }

  addBreakpoint() {
    const { breakpoint, editor } = this.props;

    // NOTE: we need to wait for the breakpoint to be loaded
    // to get the generated location
    if (this.isGeneratedSource() && breakpoint.loading) {
      return;
    }

    const location = this.getLocation();
    const line = location.line - 1;

    editor.setGutterMarker(
      line,
      "breakpoints",
      makeMarker(breakpoint.disabled)
    );
    editor.addLineClass(line, "line", "new-breakpoint");
    if (breakpoint.condition) {
      editor.addLineClass(line, "line", "has-condition");
    } else {
      editor.removeLineClass(line, "line", "has-condition");
    }
  }

  shouldComponentUpdate(nextProps: any) {
    const { editor, breakpoint, selectedSource } = this.props;
    return (
      editor !== nextProps.editor ||
      breakpoint.disabled !== nextProps.breakpoint.disabled ||
      breakpoint.condition !== nextProps.breakpoint.condition ||
      breakpoint.loading !== nextProps.breakpoint.loading ||
      selectedSource !== nextProps.selectedSource
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
    const { editor, breakpoint } = this.props;
    if (!editor) {
      return;
    }

    const location = this.getLocation();

    if (breakpoint.loading || !location) {
      return;
    }

    const line = location.line - 1;

    editor.setGutterMarker(line, "breakpoints", null);
    editor.removeLineClass(line, "line", "new-breakpoint");
    editor.removeLineClass(line, "line", "has-condition");
  }

  render() {
    return null;
  }
}

Breakpoint.displayName = "Breakpoint";

export default Breakpoint;
