// @flow
import React, { Component } from "react";
import Modal from "./shared/Modal";
import { formatKeyShortcut } from "../utils/text";

import "./ShortcutsModal.css";

export class ShortcutsModal extends Component {
  props: {
    enabled: boolean,
    handleClose: () => void
  };

  renderShorcutItem(title: string, combo: string) {
    return (
      <li>
        <span>{title}</span>
        <span>{combo}</span>
      </li>
    );
  }

  renderEditorShortcuts() {
    return (
      <ul className="shortcuts-list">
        {this.renderShorcutItem(
          L10N.getStr("shortcuts.toggleBreakpoint"),
          formatKeyShortcut(L10N.getStr("toggleBreakpoint.key"))
        )}
        {this.renderShorcutItem(
          L10N.getStr("shortcuts.toggleCondPanel"),
          formatKeyShortcut(L10N.getStr("toggleCondPanel.key"))
        )}
      </ul>
    );
  }

  renderSteppingShortcuts() {
    return (
      <ul className="shortcuts-list">
        {this.renderShorcutItem(L10N.getStr("shortcuts.pauseOrResume"), "F8")}
        {this.renderShorcutItem(L10N.getStr("shortcuts.stepOver"), "F10")}
        {this.renderShorcutItem(L10N.getStr("shortcuts.stepIn"), "F11")}
        {this.renderShorcutItem(
          L10N.getStr("shortcuts.stepOut"),
          formatKeyShortcut(L10N.getStr("stepOut.key"))
        )}
      </ul>
    );
  }

  renderSearchShortcuts() {
    return (
      <ul className="shortcuts-list">
        {this.renderShorcutItem(
          L10N.getStr("shortcuts.fileSearch"),
          formatKeyShortcut(L10N.getStr("sources.search.key2"))
        )}
        {this.renderShorcutItem(
          L10N.getStr("shortcuts.searchAgain"),
          formatKeyShortcut(L10N.getStr("sourceSearch.search.again.key2"))
        )}
        {this.renderShorcutItem(
          L10N.getStr("shortcuts.projectSearch"),
          formatKeyShortcut(L10N.getStr("projectTextSearch.key"))
        )}
        {this.renderShorcutItem(
          L10N.getStr("shortcuts.functionSearch"),
          formatKeyShortcut(L10N.getStr("functionSearch.key"))
        )}
      </ul>
    );
  }

  renderShortcutsContent() {
    return (
      <div className="shortcuts-content">
        <h2>Editor</h2>
        <div className="shortcuts-section">{this.renderEditorShortcuts()}</div>
        <h2>Stepping</h2>
        <div className="shortcuts-section">
          {this.renderSteppingShortcuts()}
        </div>
        <h2>Search</h2>
        <div className="shortcuts-section">{this.renderSearchShortcuts()}</div>
      </div>
    );
  }

  render() {
    const { enabled } = this.props;

    if (!enabled) {
      return null;
    }

    return (
      <Modal
        in={enabled}
        additionalClass="fit"
        handleClose={this.props.handleClose}
      >
        {this.renderShortcutsContent()}
      </Modal>
    );
  }
}

ShortcutsModal.displayName = "ShortcutsModal";
