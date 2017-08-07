// @flow

import { DOM as dom, createFactory, Component, PropTypes } from "react";
import type { Children } from "react";
import classnames from "classnames";
import _Transition from "react-transition-group/Transition";
const Transition = createFactory(_Transition);

import "./Modal.css";

type ModalProps = {
  status: string,
  children?: Children,
  handleClose: () => any
};

export class _Modal extends Component {
  props: ModalProps;

  constructor(props: ModalProps) {
    super(props);
    const self: any = this;
    self.onClick = this.onClick.bind(this);
  }

  onClick(e: SyntheticEvent) {
    e.stopPropagation();
  }

  render() {
    const { status } = this.props;

    return dom.div(
      {
        className: "modal-wrapper",
        onClick: this.props.handleClose
      },
      dom.div(
        { className: classnames("modal", status), onClick: this.onClick },
        this.props.children
      )
    );
  }
}

_Modal.displayName = "Modal";
_Modal.contextTypes = {
  shortcuts: PropTypes.object
};

const Modal = createFactory(_Modal);

type SlideProps = {
  in: boolean,
  children?: Children,
  handleClose: () => any
};

export default function Slide({
  in: inProp,
  children,
  handleClose
}: SlideProps) {
  return Transition({
    in: inProp,
    timeout: 175,
    appear: true,
    children: status => {
      return Modal({ status, handleClose }, children);
    }
  });
}
