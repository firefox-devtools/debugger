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
    query: string,
    setQuery: (query: string) => void,
    clearQuery: () => void
  };

  toggleSourceSearch: Function;

  searchResults(sourceMap: SourcesMap) {
    return sourceMap
      .valueSeq()
      .toJS()
      .filter(source => !isPretty(source))
      .map(source => ({
        value: getSourcePath(source),
        title: getSourcePath(source)
          .split("/")
          .pop(),
        subtitle: endTruncateStr(getSourcePath(source), 100),
        id: source.id
      }));
  }

  render() {
    const {
      sources,
      searchBottomBar,
      selectSource,
      query,
      setQuery
    } = this.props;
    return (
      <Autocomplete
        selectItem={(e, result) => {
          selectSource(result.id);
          this.props.closeActiveSearch();
        }}
        close={this.props.closeActiveSearch}
        items={this.searchResults(sources)}
        inputValue={query}
        placeholder={L10N.getStr("sourceSearch.search")}
        onChangeHandler={setQuery}
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
