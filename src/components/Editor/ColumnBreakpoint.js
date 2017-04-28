// @flow
import { PropTypes, Component } from "react";
import { isEnabled } from "devtools-config";
const ReactDOM = require("react-dom");
import Svg from "../shared/Svg";

const breakpointSvg = document.createElement("div");
ReactDOM.render(Svg("breakpoint"), breakpointSvg);

type BookMarkType = {
  clear: Function
};

function makeBookmark() {
  let widget = document.createElement("span");
  widget.innerText = "+";
  widget.classList.add("inline-bp");
  return widget;
}

class ColumnBreakpoint extends Component {
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

    const widget = makeBookmark();
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

ColumnBreakpoint.propTypes = {
  breakpoint: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired
};

ColumnBreakpoint.displayName = "ColumnBreakpoint";

export default ColumnBreakpoint;
