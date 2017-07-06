// @flow
import { Component } from "react";

import { markText } from "../../utils/editor";
require("./CallSite.css");

type MarkerType = {
  clear: Function
};

type props = {
  callSite: Object,
  editor: Object,
  breakpoint: Object,
  showCallSite: Boolean
};
export default class CallSite extends Component {
  props: props;

  addCallSite: Function;
  marker: ?MarkerType;

  constructor() {
    super();

    this.marker = undefined;
    const self: any = this;
    self.addCallSite = this.addCallSite.bind(this);
    self.clearCallSite = this.clearCallSite.bind(this);
  }

  addCallSite() {
    const { editor, callSite, breakpoint } = this.props;
    const className = !breakpoint ? "call-site" : "call-site-bp";
    this.marker = markText(editor, className, callSite.location);
  }

  clearCallSite() {
    if (this.marker) {
      this.marker.clear();
      this.marker = null;
    }
  }

  shouldComponentUpdate(nextProps: any) {
    return this.props.editor !== nextProps.editor;
  }

  componentDidMount() {
    const { breakpoint, editor, showCallSite } = this.props;
    if (!editor) {
      return;
    }

    if (!breakpoint && !showCallSite) {
      return;
    }

    this.addCallSite();
  }

  componentWillReceiveProps(nextProps: props) {
    const { breakpoint, showCallSite } = this.props;

    if (nextProps.breakpoint !== breakpoint) {
      if (this.marker) {
        this.marker.clear();
      }
      this.addCallSite();
    }

    if (nextProps.showCallSite !== showCallSite) {
      if (nextProps.showCallSite) {
        if (!this.marker) {
          this.addCallSite();
        }
      } else if (!nextProps.breakpoint) {
        this.clearCallSite();
      }
    }
  }

  componentWillUnmount() {
    if (!this.props.editor || !this.marker) {
      return;
    }
    this.marker.clear();
  }

  render() {
    return null;
  }
}

CallSite.displayName = "CallSite";
