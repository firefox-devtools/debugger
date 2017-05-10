// @flow
import { Component } from "react";
import { isEnabled } from "devtools-config";
const ReactDOM = require("react-dom");
import Svg from "../shared/Svg";
import classnames from "classnames";

const breakpointSvg = document.createElement("span");
ReactDOM.render(Svg("column-breakpoint"), breakpointSvg);

type BookMarkType = {
  clear: Function
};

function makeBookmark(isDisabled: boolean) {
  const bp = breakpointSvg.cloneNode(true);
  bp.className = classnames("editor column-breakpoint", {
    "breakpoint-disabled": isDisabled
  });

  return bp;
}

class ColumnBreakpoint extends Component {
  props: {
    breakpoint: Object,
    editor: Object
  };

  addBreakpoint: Function;
  bookmark: ?BookMarkType;

  constructor() {
    super();

    this.bookmark = undefined;
    const self: any = this;
    self.addBreakpoint = this.addBreakpoint.bind(this);
  }

  addBreakpoint() {
    if (!isEnabled("columnBreakpoints")) {
      return;
    }

    const bp = this.props.breakpoint;
    const line = bp.location.line - 1;
    const column = bp.location.column;
    const editor = this.props.editor;

    const widget = makeBookmark(bp.disabled);
    const bookmark = editor.setBookmark({ line, ch: column }, { widget });
    this.bookmark = bookmark;
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
    if (this.bookmark) this.bookmark.clear();
    this.addBreakpoint();
  }
  componentWillUnmount() {
    if (!this.props.editor || !this.bookmark) {
      return;
    }

    this.bookmark.clear();
  }
  render() {
    return null;
  }
}

ColumnBreakpoint.displayName = "ColumnBreakpoint";

export default ColumnBreakpoint;
