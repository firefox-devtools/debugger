import { showMenu } from "devtools-launchpad";
import { isOriginalId } from "devtools-source-map";
import { copyToTheClipboard } from "../../utils/clipboard";
import { getSourceLocationFromMouseEvent } from "../../utils/editor";

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
    getFunctionText
  }
) {
  const copySourceLabel = L10N.getStr("copySource");
  const copySourceKey = L10N.getStr("copySource.accesskey");
  const copyFunctionLabel = L10N.getStr("copyFunction.label");
  const copyFunctionKey = L10N.getStr("copyFunction.accesskey");
  const copySourceUrlLabel = L10N.getStr("copySourceUrl");
  const copySourceUrlKey = L10N.getStr("copySourceUrl.accesskey");
  const revealInTreeLabel = L10N.getStr("sourceTabs.revealInTree");
  const revealInTreeKey = L10N.getStr("sourceTabs.revealInTree.accesskey");
  const blackboxLabel = L10N.getStr("sourceFooter.blackbox");
  const unblackboxLabel = L10N.getStr("sourceFooter.unblackbox");
  const blackboxKey = L10N.getStr("sourceFooter.blackbox.accesskey");
  const toggleBlackBoxLabel = selectedSource.get("isBlackBoxed")
    ? unblackboxLabel
    : blackboxLabel;

  const copySourceUrl = {
    id: "node-menu-copy-source-url",
    label: copySourceUrlLabel,
    accesskey: copySourceUrlKey,
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

  const { line, ch } = editor.codeMirror.coordsChar({
    left: event.clientX,
    top: event.clientY
  });

  const sourceLocation = getSourceLocationFromMouseEvent(editor, selectedLocation, event)

  const pairedType = isOriginalId(selectedLocation.sourceId)
    ? L10N.getStr("generated")
    : L10N.getStr("original");

  const jumpLabel = {
    accesskey: "C",
    disabled: false,
    label: L10N.getFormatStr("editor.jumpToMappedLocation1", pairedType),
    click: () => jumpToMappedLocation(sourceLocation)
  };

  const watchExpressionLabel = {
    accesskey: "E",
    label: L10N.getStr("expressions.placeholder"),
    click: () => addExpression(editor.codeMirror.getSelection())
  };

  const blackBoxMenuItem = {
    id: "node-menu-blackbox",
    label: toggleBlackBoxLabel,
    accesskey: blackboxKey,
    disabled: false,
    click: () => toggleBlackBox(selectedSource.toJS())
  };

  // TODO: Find a new way to only add this for mapped sources?
  const textSelected = editor.codeMirror.somethingSelected();

  const showSourceMenuItem = {
    id: "node-menu-show-source",
    label: revealInTreeLabel,
    accesskey: revealInTreeKey,
    disabled: false,
    click: () => showSource(selectedSource.get("id"))
  };

  const functionText = getFunctionText(line + 1);
  const copyFunction = {
    id: "node-menu-copy-function",
    label: copyFunctionLabel,
    accesskey: copyFunctionKey,
    disabled: !functionText,
    click: () => copyToTheClipboard(functionText)
  };

  const menuItems = [
    copySource,
    copySourceUrl,
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

async function EditorMenu(options) {
  const { event, onGutterContextMenu } = options;

  if (event.target.classList.contains("editor.codeMirror-linenumber")) {
    return onGutterContextMenu(event);
  }

  event.stopPropagation();
  event.preventDefault();

  showMenu(event, getMenuItems(event, options));
}

export default EditorMenu;
