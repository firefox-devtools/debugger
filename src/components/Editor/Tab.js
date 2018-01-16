import React, { PureComponent } from "react";

class Tab extends PureComponent<Props, State> {
  render(source: SourceRecord) {
    const { selectedSource, selectSource, closeTab } = this.props;
    const filename = getFilename(source.toJS());
    const active =
      selectedSource &&
      source.get("id") == selectedSource.get("id") &&
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
        key={source.get("id")}
        onClick={() => selectSource(source.get("id"))}
        onContextMenu={e => this.onTabContextMenu(e, source.get("id"))}
        title={getFileURL(source.toJS())}
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
