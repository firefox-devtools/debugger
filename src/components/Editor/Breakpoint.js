// @flow
import { Component } from "react";
import { isEnabled } from "devtools-config";
import ReactDOM from "react-dom";

import classnames from "classnames";
import Svg from "../shared/Svg";

import { getDocument, showSourceText } from "../../utils/editor";

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
    const { breakpoint, editor, selectedSource } = this.props;

    // NOTE: we need to wait for the breakpoint to be loaded
    // to get the generated location
    if (!selectedSource || breakpoint.loading) {
      return;
    }

    const line = breakpoint.location.line - 1;
    showSourceText(editor, selectedSource.toJS());

    editor.codeMirror.setGutterMarker(
      line,
      "breakpoints",
      makeMarker(breakpoint.disabled)
    );

    editor.codeMirror.addLineClass(line, "line", "new-breakpoint");
    if (breakpoint.condition) {
      editor.codeMirror.addLineClass(line, "line", "has-condition");
    } else {
      editor.codeMirror.removeLineClass(line, "line", "has-condition");
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
    const { editor, breakpoint, selectedSource } = this.props;

    if (!editor || !selectedSource) {
      return;
    }

    if (breakpoint.loading) {
      return;
    }

    const line = breakpoint.location.line - 1;
    const doc = getDocument(selectedSource.get("id"));
    if (!doc) {
      return;
    }

    // NOTE: when we upgrade codemirror we can use `doc.setGutterMarker`
    if (doc.setGutterMarker) {
      doc.setGutterMarker(line, "breakpoints", null);
    } else {
      editor.codeMirror.setGutterMarker(line, "breakpoints", null);
    }

    doc.removeLineClass(line, "line", "new-breakpoint");
    doc.removeLineClass(line, "line", "has-condition");
  }

  render() {
    return null;
  }
}

Breakpoint.displayName = "Breakpoint";

export default Breakpoint;
