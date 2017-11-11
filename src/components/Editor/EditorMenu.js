/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { PureComponent } from "react";
import { showMenu } from "devtools-contextmenu";
import { isOriginalId, isGeneratedId } from "devtools-source-map";
import { copyToTheClipboard } from "../../utils/clipboard";
import { isPretty } from "../../utils/source";
import { getSourceLocationFromMouseEvent } from "../../utils/editor";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { findFunctionText } from "../../utils/function";
import { findClosestScope } from "../../utils/breakpoint/astBreakpointLocation";
import {
  getContextMenu,
  getSelectedLocation,
  getSelectedSource,
  getSymbols
} from "../../selectors";

import actions from "../../actions";

type Props = {
  setContextMenu: Function
};

function getMenuItems(
  event,
  {
    editor,
    selectedLocation,
    selectedSource,
    showSource,
    onGutterContextMenu,
    jumpToMappedLocation,
    toggleBlackBox,
    addExpression,
    getFunctionText,
    getFunctionLocation,
    flashLineRange
  }
) {
  const copySourceLabel = L10N.getStr("copySource");
  const copySourceKey = L10N.getStr("copySource.accesskey");
  const copyFunctionLabel = L10N.getStr("copyFunction.label");
  const copyFunctionKey = L10N.getStr("copyFunction.accesskey");
  const copySourceUri2Label = L10N.getStr("copySourceUri2");
  const copySourceUri2Key = L10N.getStr("copySourceUri2.accesskey");
  const revealInTreeLabel = L10N.getStr("sourceTabs.revealInTree");
  const revealInTreeKey = L10N.getStr("sourceTabs.revealInTree.accesskey");
  const blackboxLabel = L10N.getStr("sourceFooter.blackbox");
  const unblackboxLabel = L10N.getStr("sourceFooter.unblackbox");
  const blackboxKey = L10N.getStr("sourceFooter.blackbox.accesskey");
  const toggleBlackBoxLabel = selectedSource.get("isBlackBoxed")
    ? unblackboxLabel
    : blackboxLabel;

  const copySourceUri2 = {
    id: "node-menu-copy-source-url",
    label: copySourceUri2Label,
    accesskey: copySourceUri2Key,
    disabled: false,
    click: () => copyToTheClipboard(selectedSource.get("url"))
  };

  const selectionText = editor.codeMirror.getSelection().trim();
  const copySource = {
    id: "node-menu-copy-source",
    label: copySourceLabel,
    accesskey: copySourceKey,
    disabled: selectionText.length === 0,
    click: () => copyToTheClipboard(selectionText)
  };

  const { line } = editor.codeMirror.coordsChar({
    left: event.clientX,
    top: event.clientY
  });

  const sourceLocation = getSourceLocationFromMouseEvent(
    editor,
    selectedLocation,
    event
  );

  const isOriginal = isOriginalId(selectedLocation.sourceId);
  const hasSourceMap = selectedSource.get("sourceMapURL");
  const isPrettyPrinted = isPretty(selectedSource.toJS());

  const jumpLabel = {
    id: "node-menu-jump",
    accesskey: L10N.getStr("editor.jumpToMappedLocation1.accesskey"),
    disabled: isGeneratedId && !hasSourceMap,
    label: L10N.getFormatStr(
      "editor.jumpToMappedLocation1",
      isOriginal ? L10N.getStr("generated") : L10N.getStr("original")
    ),
    click: () => jumpToMappedLocation(sourceLocation)
  };

  const watchExpressionLabel = {
    id: "node-menu-add-watch-expression",
    accesskey: L10N.getStr("expressions.accesskey"),
    label: L10N.getStr("expressions.label"),
    click: () => addExpression(editor.codeMirror.getSelection())
  };

  const blackBoxMenuItem = {
    id: "node-menu-blackbox",
    label: toggleBlackBoxLabel,
    accesskey: blackboxKey,
    disabled: isOriginal || isPrettyPrinted || hasSourceMap,
    click: () => toggleBlackBox(selectedSource.toJS())
  };

  // TODO: Find a new way to only add this for mapped sources?
  const textSelected = editor.codeMirror.somethingSelected();

  const showSourceMenuItem = {
    id: "node-menu-show-source",
    label: revealInTreeLabel,
    accesskey: revealInTreeKey,
    disabled: isPrettyPrinted,
    click: () => showSource(selectedSource.get("id"))
  };

  const functionText = getFunctionText(line + 1);
  const copyFunction = {
    id: "node-menu-copy-function",
    label: copyFunctionLabel,
    accesskey: copyFunctionKey,
    disabled: !functionText,
    click: () => {
      const { location: { start, end } } = getFunctionLocation(line);
      flashLineRange({
        start: start.line,
        end: end.line,
        sourceId: selectedLocation.sourceId
      });
      return copyToTheClipboard(functionText);
    }
  };

  const menuItems = [
    copySource,
    copySourceUri2,
    copyFunction,
    { type: "separator" },
    jumpLabel,
    showSourceMenuItem,
    blackBoxMenuItem
  ];

  if (textSelected) {
    menuItems.push(watchExpressionLabel);
  }

  return menuItems;
}

class EditorMenu extends PureComponent {
  props: Props;

  constructor() {
    super();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.contextMenu.type === "Editor";
  }

  componentWillUpdate(nextProps) {
    // clear the context menu since it is open
    this.props.setContextMenu("", null);
    return this.showMenu(nextProps);
  }

  showMenu(nextProps) {
    const { contextMenu, ...options } = nextProps;
    const { event } = contextMenu;
    showMenu(event, getMenuItems(event, options));
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
      selectedSource,
      contextMenu: getContextMenu(state),
      getFunctionText: line =>
        findFunctionText(
          line,
          selectedSource.toJS(),
          getSymbols(state, selectedSource.toJS())
        ),
      getFunctionLocation: line =>
        findClosestScope(getSymbols(state, selectedSource.toJS()).functions, {
          line,
          column: Infinity
        })
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(EditorMenu);
