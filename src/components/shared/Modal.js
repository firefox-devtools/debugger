// @flow

import React, { PropTypes, Component } from "react";
import type { Children } from "react";
import classnames from "classnames";
import Transition from "react-transition-group/Transition";
import "./Modal.css";

type ModalProps = {
  status: string,
  children?: Children,
  height?: string,
  handleClose: () => any
};

export class Modal extends Component {
  props: ModalProps;

  constructor(props: ModalProps) {
    super(props);
    const self: any = this;
    self.onClick = this.onClick.bind(this);
  }

  overrideHeight() {
    return { height: this.props.height };
  }

  onClick(e: SyntheticEvent) {
    e.stopPropagation();
  }

  render() {
    const { status } = this.props;

    return (
      <div className="modal-wrapper" onClick={this.props.handleClose}>
        <div
          className={classnames("modal", status)}
          style={this.overrideHeight()}
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
  height?: string,
  handleClose: () => any
};

export default function Slide({
  in: inProp,
  children,
  height,
  handleClose
}: SlideProps) {
  return (
    <Transition in={inProp} timeout={175} appear>
      {status => (
        <Modal status={status} height={height} handleClose={handleClose}>
          {children}
        </Modal>
      )}
    </Transition>
  );
}
