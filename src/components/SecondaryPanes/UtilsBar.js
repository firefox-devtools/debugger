// @flow
import React, { Component } from "react";
import classnames from "classnames";
import Svg from "../shared/Svg";
import "./CommandBar.css";

function debugBtn(onClick, type, className, tooltip, disabled = false) {
  const props = {
    onClick,
    key: type,
    "aria-label": tooltip,
    title: tooltip,
    disabled
  };

  return (
    <button className={classnames(type, className)} {...props}>
      <Svg name={type} />
    </button>
  );
}

debugBtn.displayName = "UtilsBarButton";

class UtilsBar extends Component {
  props: {
    horizontal: boolean,
    toggleShortcutsModal: () => void
  };

  renderUtilButtons() {
    return [
      debugBtn(
        this.props.toggleShortcutsModal,
        "shortcut",
        "active",
        "shortcuts",
        false
      )
    ];
  }

  render() {
    return (
      <div
        className={classnames("command-bar bottom", {
          vertical: !this.props.horizontal
        })}
      >
        {this.renderUtilButtons()}
      </div>
    );
  }
}

export default UtilsBar;
