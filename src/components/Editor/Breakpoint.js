// @flow
import { Component } from "react";
import { isEnabled } from "devtools-config";
import ReactDOM from "react-dom";

import classnames from "classnames";
import Svg from "../shared/Svg";

import { getDocument, showSourceText, toEditorLine } from "../../utils/editor";

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

type Props = {
  breakpoint: Object,
  selectedSource: Object,
  line: number,
  editor: Object
};

class Breakpoint extends Component<Props> {
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

    const sourceId = selectedSource.get("id");
    const line = toEditorLine(sourceId, breakpoint.location.line);

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
    this.addBreakpoint();
  }

  componentDidUpdate() {
    this.addBreakpoint();
  }

  componentWillUnmount() {
    const { editor, breakpoint, selectedSource } = this.props;

    if (!selectedSource) {
      return;
    }

    if (breakpoint.loading) {
      return;
    }

    const sourceId = selectedSource.get("id");
    const doc = getDocument(sourceId);
    if (!doc) {
      return;
    }

    const line = toEditorLine(sourceId, breakpoint.location.line);

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
