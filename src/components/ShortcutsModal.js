// @flow
import React, { Component } from "react";
import Modal from "./shared/Modal";

import "./ShortcutsModal.css";

export class ShortcutsModal extends Component {
  props: {
    enabled: boolean
  };

  render() {
    const { enabled } = this.props;

    if (!enabled) {
      return null;
    }

    return <Modal in={enabled} handleClose={() => console.log("hisam")} />;
  }
}

ShortcutsModal.displayName = "ShortcutsModal";
