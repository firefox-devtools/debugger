// @flow

import React, { PropTypes, Component } from "react";
import type { Children } from "react";
import classnames from "classnames";
import Transition from "react-transition-group/Transition";
import "./Modal.css";

type ModalProps = {
  status: string,
  children?: Children,
  additionalClass?: string,
  handleClose: () => any
};

export class Modal extends Component {
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

    return (
      <div className="modal-wrapper" onClick={this.props.handleClose}>
        <div
          className={classnames("modal", this.props.additionalClass, status)}
          onClick={this.onClick}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

Modal.contextTypes = {
  shortcuts: PropTypes.object
};

type SlideProps = {
  in: boolean,
  children?: Children,
  className?: string,
  handleClose: () => any
};

export default function Slide({
  in: inProp,
  children,
  additionalClass,
  handleClose
}: SlideProps) {
  return (
    <Transition in={inProp} timeout={175} appear>
      {status => (
        <Modal
          status={status}
          additionalClass={additionalClass}
          handleClose={handleClose}
        >
          {children}
        </Modal>
      )}
    </Transition>
  );
}
