import { showMenu } from "devtools-launchpad";
import { isOriginalId } from "devtools-source-map";
import { copyToTheClipboard } from "../../utils/clipboard";
import { clearShownSource } from "../../actions/ui";

function getMenuItems(
  event,
  {
    codeMirror,
    selectedLocation,
    selectedSource,
    showSource,
    onGutterContextMenu,
    jumpToMappedLocation,
    toggleBlackBox,
    addExpression
  }
) {
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
    id: "node-menu-copy-source",
    label: copySourceUrlLabel,
    accesskey: copySourceUrlKey,
    disabled: false,
    click: () => copyToTheClipboard(selectedSource.get("url"))
  };

  const { line, ch } = codeMirror.coordsChar({
    left: event.clientX,
    top: event.clientY
  });

  const sourceLocation = {
    sourceId: selectedLocation.sourceId,
    line: line + 1,
    column: ch + 1
  };

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
    click: () => addExpression(codeMirror.getSelection())
  };

  const blackBoxMenuItem = {
    id: "node-menu-blackbox",
    label: toggleBlackBoxLabel,
    accesskey: blackboxKey,
    disabled: false,
    click: () => toggleBlackBox(selectedSource.toJS())
  };

  // TODO: Find a new way to only add this for mapped sources?
  const textSelected = codeMirror.somethingSelected();

  const showSourceMenuItem = {
    id: "node-menu-show-source",
    label: revealInTreeLabel,
    accesskey: revealInTreeKey,
    disabled: false,
    click: () => {
      clearShownSource();
      showSource(selectedSource.get("id"));
    }
  };

  if (selectedSource && selectedSource.get("isBlackBoxed")) {
    return [blackBoxMenuItem];
  }

  let menuItems = [
    copySourceUrl,
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

  if (event.target.classList.contains("CodeMirror-linenumber")) {
    return onGutterContextMenu(event);
  }

  event.stopPropagation();
  event.preventDefault();

  showMenu(event, getMenuItems(event, options));
}

export default EditorMenu;
