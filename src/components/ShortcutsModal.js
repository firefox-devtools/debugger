// @flow
import React, { Component, PropTypes } from "react";
import Modal from "./shared/Modal";

import "./ShortcutsModal.css";

export class ShortcutsModal extends Component {
  state: SymbolModalState;

  props: {};

  constructor(props) {
    super(props);
  }

  render() {
    const { enabled } = this.props;

    if (!enabled) {
      return null;
    }

    return <Modal in={enabled} handleClose={this.closeModal} />;
  }
}

ShortcutsModal.propTypes = {
  enabled: PropTypes.bool
};

ShortcutsModal.displayName = "ShortcutsModal";
