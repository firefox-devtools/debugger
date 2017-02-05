const { showMenu } = require("../shared/menu");
const { isEnabled } = require("devtools-config");
const { isOriginalId, hasMappedSource } = require("../../utils/source-map");
const { copyToTheClipboard } = require("../../utils/clipboard");

async function EditorMenu({ cm, event, editor,
  selectedLocation,
  selectedSource,
  showSource,
  onGutterContextMenu,
  jumpToMappedLocation,
  addExpression
  }) {
  const copySourceUrlLabel = L10N.getStr("copySourceUrl");
  const copySourceUrlKey = L10N.getStr("copySourceUrl.key");
  const revealInTreeLabel = L10N.getStr("sourceTabs.revealInTree");
  const revealInTreeKey = L10N.getStr("sourceTabs.revealInTree.key");

  if (event.target.classList.contains("CodeMirror-linenumber")) {
    return onGutterContextMenu(event);
  }

  event.stopPropagation();
  event.preventDefault();

  const isMapped = await hasMappedSource(selectedLocation);

  const copySourceUrl = {
    id: "node-menu-copy-source",
    label: copySourceUrlLabel,
    accesskey: copySourceUrlKey,
    disabled: false,
    click: () => copyToTheClipboard(selectedSource.get("url"))
  };

  const { line, ch } = editor.codeMirror.coordsChar({
    left: event.clientX,
    top: event.clientY
  });

  const sourceLocation = {
    sourceId: selectedLocation.sourceId,
    line: line + 1,
    column: ch + 1
  };

  const pairedType = isOriginalId(selectedLocation.sourceId)
    ? L10N.getStr("generated") : L10N.getStr("original");

  const jumpLabel = {
    accesskey: "C",
    disabled: false,
    label: L10N.getFormatStr("editor.jumpToMappedLocation1", pairedType),
    click: () => jumpToMappedLocation(sourceLocation)
  };

  const watchExpressionLabel = {
    accesskey: "E",
    label: L10N.getStr("expressions.placeholder"),
    click: () => addExpression({
      input: editor.codeMirror.getSelection()
    })
  };

  const menuOptions = [];

  if (isMapped) {
    menuOptions.push(jumpLabel);
  }

  const textSelected = editor.codeMirror.somethingSelected();
  if (isEnabled("watchExpressions") && textSelected) {
    menuOptions.push(watchExpressionLabel);
  }

  if (isEnabled("copySource")) {
    menuOptions.push(copySourceUrl);
  }

  const showSourceMenuItem = {
    id: "node-menu-show-source",
    label: revealInTreeLabel,
    accesskey: revealInTreeKey,
    disabled: false,
    click: () => showSource(selectedSource.get("id"))
  };
  menuOptions.push(showSourceMenuItem);

  showMenu(event, menuOptions);
}

module.exports = EditorMenu;
