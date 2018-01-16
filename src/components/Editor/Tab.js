import React, { PureComponent } from "react";

import { showMenu, buildMenu } from "devtools-contextmenu";

import CloseButton from "../shared/Button/Close";

import type { List } from "immutable";
import type { SourceRecord } from "../../reducers/sources";

import { getFilename, getFileURL, isPretty } from "../../utils/source";
import { copyToTheClipboard } from "../../utils/clipboard";
import classnames from "classnames";

type SourcesList = List<SourceRecord>;

type Props = {
  tabSources: SourcesList,
  selectSource: Object => void,
  selectedSource: SourceRecord,
  closeTab: string => void,
  closeTabs: (List<string>) => void,
  togglePrettyPrint: string => void,
  showSource: string => void,
  source: SourceRecord,
  sourceTabsMetaData: {
    [key: string]: SourceMetaDataMap
  }
};

export default class Tab extends PureComponent<Props, State> {
  constructor() {
    super();
  }

  onTabContextMenu = (event, tab: string) => {
    event.preventDefault();
    this.showContextMenu(event, tab);
  };

  getSourceAnnotation(source) {
    const sourceId = source.get("id");
    const sourceMetaData = this.props.sourceTabsMetaData[sourceId];

    if (sourceMetaData && sourceMetaData.isReactComponent) {
      return <img className="react" />;
    }
    if (isPretty(source)) {
      return <img className="prettyPrint" />;
    }
    if (source.get("isBlackBoxed")) {
      return <img className="blackBox" />;
    }
  }

  showContextMenu(e, tab) {
    const { closeTab, tabSources, showSource, togglePrettyPrint } = this.props;

    const closeTabLabel = L10N.getStr("sourceTabs.closeTab");
    const closeOtherTabsLabel = L10N.getStr("sourceTabs.closeOtherTabs");
    const closeTabsToEndLabel = L10N.getStr("sourceTabs.closeTabsToEnd");
    const closeAllTabsLabel = L10N.getStr("sourceTabs.closeAllTabs");
    const revealInTreeLabel = L10N.getStr("sourceTabs.revealInTree");
    const copyLinkLabel = L10N.getStr("copySourceUri2");
    const prettyPrintLabel = L10N.getStr("sourceTabs.prettyPrint");

    const closeTabKey = L10N.getStr("sourceTabs.closeTab.accesskey");
    const closeOtherTabsKey = L10N.getStr(
      "sourceTabs.closeOtherTabs.accesskey"
    );
    const closeTabsToEndKey = L10N.getStr(
      "sourceTabs.closeTabsToEnd.accesskey"
    );
    const closeAllTabsKey = L10N.getStr("sourceTabs.closeAllTabs.accesskey");
    const revealInTreeKey = L10N.getStr("sourceTabs.revealInTree.accesskey");
    const copyLinkKey = L10N.getStr("copySourceUri2.accesskey");
    const prettyPrintKey = L10N.getStr("sourceTabs.prettyPrint.accesskey");

    const tabIDs = tabSources.map(t => t.get("id"));
    const otherTabs = tabSources.filter(t => t !== tab);
    const tabID = tabIDs.find(t => t == tab);
    const tabURLs = tabSources.map(t => t.get("url"));
    const otherTabURLs = otherTabs.map(t => t.get("url"));

    if (!tabID) {
      return;
    }

    const isPrettySource = isPretty(tabID);

    const closeTabMenuItem = {
      id: "node-menu-close-tab",
      label: closeTabLabel,
      accesskey: closeTabKey,
      disabled: false,
      click: () => closeTab(tab.get("url"))
    };

    const closeOtherTabsMenuItem = {
      id: "node-menu-close-other-tabs",
      label: closeOtherTabsLabel,
      accesskey: closeOtherTabsKey,
      disabled: false,
      click: () => closeTabs(otherTabURLs)
    };

    const closeTabsToEndMenuItem = {
      id: "node-menu-close-tabs-to-end",
      label: closeTabsToEndLabel,
      accesskey: closeTabsToEndKey,
      disabled: false,
      click: () => {
        const tabIndex = tabSources.findIndex(t => t == tab);
        closeTabs(tabURLs.filter((t, i) => i > tabIndex));
      }
    };

    const closeAllTabsMenuItem = {
      id: "node-menu-close-all-tabs",
      label: closeAllTabsLabel,
      accesskey: closeAllTabsKey,
      disabled: false,
      click: () => closeTabs(tabURLs)
    };

    const showSourceMenuItem = {
      id: "node-menu-show-source",
      label: revealInTreeLabel,
      accesskey: revealInTreeKey,
      disabled: false,
      click: () => showSource(tab)
    };

    const copySourceUri2 = {
      id: "node-menu-copy-source-url",
      label: copyLinkLabel,
      accesskey: copyLinkKey,
      disabled: false,
      click: () => copyToTheClipboard(sourceTab.get("url"))
    };

    const prettyPrint = {
      id: "node-menu-pretty-print",
      label: prettyPrintLabel,
      accesskey: prettyPrintKey,
      disabled: false,
      click: () => togglePrettyPrint(sourceTab.get("id"))
    };

    const items = [
      { item: closeTabMenuItem },
      { item: closeOtherTabsMenuItem, hidden: () => tabSources.size === 1 },
      {
        item: closeTabsToEndMenuItem,
        hidden: () =>
          tabSources.some((t, i) => t === tab && tabSources.size - 1 === i)
      },
      { item: closeAllTabsMenuItem },
      { item: { type: "separator" } },
      { item: copySourceUri2 }
    ];

    if (!isPrettySource) {
      items.push({ item: showSourceMenuItem });
      items.push({ item: prettyPrint });
    }

    showMenu(e, buildMenu(items));
  }

  isProjectSearchEnabled() {
    return this.props.activeSearch === "project";
  }

  isSourceSearchEnabled() {
    return this.props.activeSearch === "source";
  }

  render() {
    const { selectedSource, selectSource, closeTab, source } = this.props;
    const src = source.toJS();
    const filename = getFilename(src);
    const sourceId = source.get("id");
    const active =
      selectedSource &&
      sourceId == selectedSource.get("id") &&
      (!this.isProjectSearchEnabled() && !this.isSourceSearchEnabled());
    const isPrettyCode = isPretty(source);
    const sourceAnnotation = this.getSourceAnnotation(source);

    function onClickClose(ev) {
      ev.stopPropagation();
      closeTab(source.get("url"));
    }

    const className = classnames("source-tab", {
      active,
      pretty: isPrettyCode
    });

    return (
      <div
        className={className}
        key={sourceId}
        onClick={() => selectSource(sourceId)}
        onContextMenu={e => this.onTabContextMenu(e, sourceId)}
        title={getFileURL(src)}
      >
        {sourceAnnotation}
        <div className="filename">{filename}</div>
        <CloseButton
          handleClick={onClickClose}
          tooltip={L10N.getStr("sourceTabs.closeTabButtonTooltip")}
        />
      </div>
    );
  }
}
