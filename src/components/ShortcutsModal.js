// @flow
import React, { Component } from "react";
import Modal from "./shared/Modal";

import "./ShortcutsModal.css";

export class ShortcutsModal extends Component {
  props: {
    enabled: boolean,
    handleClose: () => void
  };

  renderShortcuts() {
    return <ul />;
  }

  render() {
    const { enabled } = this.props;

    if (!enabled) {
      return null;
    }

    return (
      <Modal in={enabled} handleClose={this.props.handleClose}>
        {this.renderShortcuts()}
      </Modal>
    );
  }
}

ShortcutsModal.displayName = "ShortcutsModal";
