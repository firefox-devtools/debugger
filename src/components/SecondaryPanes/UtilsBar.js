// @flow
import React, { Component } from "react";
import classnames from "classnames";
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
      ?
    </button>
  );
}

type Props = {
  horizontal: boolean,
  toggleShortcutsModal: () => void
};

class UtilsBar extends Component<Props> {
  renderUtilButtons() {
    return [
      debugBtn(
        this.props.toggleShortcutsModal,
        "shortcut",
        "active",
        L10N.getStr("shortcuts.buttonName"),
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
