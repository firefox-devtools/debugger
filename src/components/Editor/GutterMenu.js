/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { PureComponent } from "react";
import { showMenu } from "devtools-launchpad";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { lineAtHeight } from "../../utils/editor";
import {
  getContextMenu,
  getEmptyLines,
  getSelectedLocation,
  getSelectedSource,
  getVisibleBreakpoints,
  getPause
} from "../../selectors";

import actions from "../../actions";

type Props = {
  setContextMenu: Function
};

export function gutterMenu({
  breakpoint,
  line,
  event,
  pauseData,
  toggleBreakpoint,
  openConditionalPanel,
  toggleDisabledBreakpoint,
  isCbPanelOpen,
  closeConditionalPanel,
  continueToHere
}) {
  event.stopPropagation();
  event.preventDefault();

  const gutterItems = {
    addBreakpoint: {
      id: "node-menu-add-breakpoint",
      label: L10N.getStr("editor.addBreakpoint")
    },
    addConditional: {
      id: "node-menu-add-conditional-breakpoint",
      label: L10N.getStr("editor.addConditionalBreakpoint")
    },
    removeBreakpoint: {
      id: "node-menu-remove-breakpoint",
      label: L10N.getStr("editor.removeBreakpoint")
    },
    editConditional: {
      id: "node-menu-edit-conditional-breakpoint",
      label: L10N.getStr("editor.editBreakpoint")
    },
    enableBreakpoint: {
      id: "node-menu-enable-breakpoint",
      label: L10N.getStr("editor.enableBreakpoint")
    },
    disableBreakpoint: {
      id: "node-menu-disable-breakpoint",
      label: L10N.getStr("editor.disableBreakpoint")
    },
    continueToHere: {
      id: "node-menu-continue-to-here",
      label: L10N.getStr("editor.continueToHere.label")
    }
  };

  const toggleBreakpointItem = Object.assign(
    {
      accesskey: L10N.getStr("shortcuts.toggleBreakpoint.accesskey"),
      disabled: false,
      click: () => {
        toggleBreakpoint(line);
        if (isCbPanelOpen) {
          closeConditionalPanel();
        }
      }
    },
    breakpoint ? gutterItems.removeBreakpoint : gutterItems.addBreakpoint
  );

  const conditionalBreakpoint = Object.assign(
    {
      accesskey: L10N.getStr("editor.addConditionalBreakpoint.accesskey"),
      disabled: false,
      click: () => openConditionalPanel(line)
    },
    breakpoint && breakpoint.condition
      ? gutterItems.editConditional
      : gutterItems.addConditional
  );

  const items = [toggleBreakpointItem, conditionalBreakpoint];

  if (pauseData) {
    const continueToHereItem = {
      accesskey: L10N.getStr("editor.continueToHere.accesskey"),
      disabled: false,
      click: () => continueToHere(line),
      ...gutterItems.continueToHere
    };
    items.push(continueToHereItem);
  }

  if (breakpoint) {
    const disableBreakpoint = Object.assign(
      {
        accesskey: L10N.getStr("editor.disableBreakpoint.accesskey"),
        disabled: false,
        click: () => toggleDisabledBreakpoint(line)
      },
      breakpoint.disabled
        ? gutterItems.enableBreakpoint
        : gutterItems.disableBreakpoint
    );
    items.push(disableBreakpoint);
  }

  showMenu(event, items);
}

class GutterContextMenuComponent extends PureComponent {
  props: Props;

  constructor() {
    super();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.contextMenu.type === "Gutter";
  }

  componentWillUpdate(nextProps) {
    // clear the context menu since it is open
    this.props.setContextMenu("", null);
    return this.showMenu(nextProps);
  }

  showMenu(nextProps) {
    const { contextMenu, ...props } = nextProps;
    const { event } = contextMenu;
    const sourceId = props.selectedSource ? props.selectedSource.get("id") : "";
    const line = lineAtHeight(props.editor, sourceId, event);
    const breakpoint = nextProps.breakpoints.find(
      bp => bp.location.line === line
    );

    if (props.emptyLines.includes(line)) {
      return;
    }

    gutterMenu({ event, sourceId, line, breakpoint, ...props });
  }

  render() {
    return null;
  }
}

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    return {
      selectedLocation: getSelectedLocation(state),
      selectedSource: selectedSource,
      breakpoints: getVisibleBreakpoints(state),
      pauseData: getPause(state),
      contextMenu: getContextMenu(state),
      emptyLines: selectedSource
        ? getEmptyLines(state, selectedSource.toJS())
        : []
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(GutterContextMenuComponent);
