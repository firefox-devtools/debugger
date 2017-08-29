import React, { Component, PropTypes } from "react";

import { isPretty, getSourcePath } from "../../utils/source";
import { endTruncateStr } from "../../utils/utils";

import Autocomplete from "../shared/Autocomplete";

import type { SourcesMap } from "../../reducers/sources";

export default class SourceSearch extends Component {
  props: {
    closeActiveSearch: () => any,
    selectSource: string => any,
    sources: Object,
    searchBottomBar: Object,
    queryString: string,
    queryStringChangeHandler: (queryString: string) => void
  };

  onEscape: Function;
  close: Function;
  toggleSourceSearch: Function;

  constructor(props: Props) {
    super(props);

    this.close = this.close.bind(this);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("Escape", this.onEscape);
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("Escape", this.onEscape);
  }

  onEscape(shortcut, e) {
    if (this.isProjectSearchEnabled()) {
      e.preventDefault();
      this.close();
    }
  }

  searchResults(sourceMap: SourcesMap) {
    return sourceMap
      .valueSeq()
      .toJS()
      .filter(source => !isPretty(source))
      .map(source => ({
        value: getSourcePath(source),
        title: getSourcePath(source).split("/").pop(),
        subtitle: endTruncateStr(getSourcePath(source), 100),
        id: source.id
      }));
  }

  close() {
    this.props.clearSourceSearchQueryString();
    this.props.closeActiveSearch();
  }

  render() {
    const {
      sources,
      searchBottomBar,
      selectSource,
      queryString,
      queryStringChangeHandler
    } = this.props;
    return (
      <Autocomplete
        selectItem={(e, result) => {
          selectSource(result.id);
          this.close();
        }}
        close={this.close}
        items={this.searchResults(sources)}
        inputValue={queryString}
        placeholder={L10N.getStr("sourceSearch.search")}
        onChangeHandler={queryStringChangeHandler}
        size="big"
      >
        {searchBottomBar}
      </Autocomplete>
    );
  }
}

SourceSearch.contextTypes = {
  shortcuts: PropTypes.object
};

SourceSearch.displayName = "SourceSearch";
