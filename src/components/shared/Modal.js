// @flow

import { DOM as dom, Component, PropTypes } from "react";
import type { Children } from "react";
import classnames from "classnames";

import "./Modal.css";

type ModalProps = {
  enabled: boolean,
  shortcut: string,
  children?: Children,
  handleOpen: (_: any, e: SyntheticEvent) => any,
  handleClose: () => any
};

export default class Modal extends Component {
  props: ModalProps;

  constructor(props: ModalProps) {
    super(props);
    const self: any = this;
    self.onClick = this.onClick.bind(this);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("Escape");
    shortcuts.off(L10N.getStr(this.props.shortcut));
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("Escape", this.props.handleClose);
    shortcuts.on(L10N.getStr(this.props.shortcut), this.props.handleOpen);
  }

  onClick(e: SyntheticEvent) {
    e.stopPropagation();
  }

  render() {
    const { enabled } = this.props;
    return dom.div(
      {
        className: classnames("modal-wrapper", { enabled }),
        onClick: this.props.handleClose
      },
      dom.div(
        { className: classnames("modal", { enabled }), onClick: this.onClick },
        this.props.children
      )
    );
  }
}

Modal.displayName = "Modal";
Modal.contextTypes = {
  shortcuts: PropTypes.object
};
