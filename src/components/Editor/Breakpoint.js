// @flow
import { PropTypes, Component } from "react";
const ReactDOM = require("react-dom");

import classnames from "classnames";
import Svg from "../shared/Svg";

const breakpointSvg = document.createElement("div");
ReactDOM.render(Svg("breakpoint"), breakpointSvg);

function makeMarker(isDisabled: boolean) {
  const bp = breakpointSvg.cloneNode(true);
  bp.className = classnames("editor new-breakpoint", {
    "breakpoint-disabled": isDisabled,
  });

  return bp;
}

class Breakpoint extends Component {
  addBreakpoint: Function;

  constructor(props) {
    super(props);
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
    return this.props.editor !== nextProps.editor ||
      this.props.breakpoint.disabled !== nextProps.breakpoint.disabled ||
      this.props.breakpoint.condition !== nextProps.breakpoint.condition;
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

Breakpoint.propTypes = {
  breakpoint: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired,
};

Breakpoint.displayName = "Breakpoint";

export default Breakpoint;
