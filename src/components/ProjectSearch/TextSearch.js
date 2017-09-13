import React, { Component, PropTypes } from "react";
import classnames from "classnames";

import Svg from "../shared/Svg";

import ManagedTree from "../shared/ManagedTree";
import SearchInput from "../shared/SearchInput";

import "./TextSearch.css";

import { getRelativePath } from "../../utils/sources-tree";

export default class TextSearch extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      inputValue: this.props.query || ""
    };

    this.focusedItem = null;
    this.inputFocused = false;

    this.inputOnChange = this.inputOnChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onEnterPress = this.onEnterPress.bind(this);
    this.selectMatchItem = this.selectMatchItem.bind(this);
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("Enter", this.onEnterPress);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("Enter", this.onEnterPress);
  }

  selectMatchItem(matchItem) {
    this.props.selectSource(matchItem.sourceId, { line: matchItem.line });
  }

  getResults() {
    const { results } = this.props;
    return results.filter(
      result => result.filepath && result.matches.length > 0
    );
  }

  getResultCount() {
    const results = this.getResults();
    return results.reduce(
      (count, file) => count + (file.matches ? file.matches.length : 0),
      0
    );
  }

  onKeyDown(e) {
    if (e.key === "Escape") {
      return;
    }

    e.stopPropagation();

    if (e.key !== "Enter") {
      return;
    }
    this.focusedItem = null;
    this.props.searchSources(this.state.inputValue);
  }

  onEnterPress() {
    if (this.focusedItem && !this.inputFocused) {
      const { setExpanded, file, expanded, match } = this.focusedItem;
      if (setExpanded) {
        setExpanded(file, !expanded);
      } else {
        this.selectMatchItem(match);
      }
    }
  }

  inputOnChange(e) {
    const inputValue = e.target.value;
    this.setState({ inputValue });
  }

  renderFile(file, focused, expanded, setExpanded) {
    if (focused) {
      this.focusedItem = { setExpanded, file, expanded };
    }

    const matchesLength = file.matches.length;
    const matches = ` (${matchesLength} match${matchesLength > 1 ? "es" : ""})`;

    return (
      <div
        className={classnames("file-result", { focused })}
        key={file.sourceId}
        onClick={e => setExpanded(file, !expanded)}
      >
        <Svg name="arrow" className={classnames({ expanded })} />
        <Svg name="file" />
        <span className="file-path">{getRelativePath(file.filepath)}</span>
        <span className="matches-summary">{matches}</span>
      </div>
    );
  }

  renderMatch(match, focused) {
    if (focused) {
      this.focusedItem = { match };
    }
    return (
      <div
        className={classnames("result", { focused })}
        onClick={() => setTimeout(() => this.selectMatchItem(match), 50)}
      >
        <span className="line-number" key={match.line}>
          {match.line}
        </span>
        {this.renderMatchValue(match)}
      </div>
    );
  }

  renderMatchValue(lineMatch) {
    const { value, column, match } = lineMatch;
    const len = match.length;

    return (
      <span className="line-value">
        <span className="line-match" key={0}>
          {value.slice(0, column)}
        </span>
        <span className="query-match" key={1}>
          {value.substr(column, len)}
        </span>
        <span className="line-match" key={2}>
          {value.slice(column + len, value.length)}
        </span>
      </span>
    );
  }

  renderResults() {
    const results = this.getResults();
    results = results.filter(result => result.matches.length > 0);
    function getFilePath(item, index) {
      return item.filepath
        ? `${item.sourceId}-${index}`
        : `${item.sourceId}-${item.line}-${item.column}-${index}`;
    }

    const renderItem = (item, depth, focused, _, expanded, { setExpanded }) => {
      return item.filepath
        ? this.renderFile(item, focused, expanded, setExpanded)
        : this.renderMatch(item, focused);
    };

    if (results.length) {
      return (
        <ManagedTree
          getRoots={() => results}
          getChildren={file => file.matches || []}
          itemHeight={24}
          autoExpand={1}
          autoExpandDepth={1}
          getParent={item => null}
          getPath={getFilePath}
          renderItem={renderItem}
        />
      );
    } else if (this.props.query && !results.length) {
      return (
        <div className="no-result-msg absolute-center">
          {L10N.getStr("projectTextSearch.noResults")}
        </div>
      );
    }
  }

  renderInput() {
    const resultCount = this.getResultCount();
    const summaryMsg = L10N.getFormatStr(
      "sourceSearch.resultsSummary1",
      resultCount
    );

    return (
      <SearchInput
        query={this.state.inputValue}
        count={resultCount}
        placeholder={L10N.getStr("projectTextSearch.placeholder")}
        size="big"
        summaryMsg={summaryMsg}
        onChange={e => this.inputOnChange(e)}
        onFocus={() => (this.inputFocused = true)}
        onBlur={() => (this.inputFocused = false)}
        onKeyDown={e => this.onKeyDown(e)}
        handleClose={this.props.closeActiveSearch}
        ref="searchInput"
      />
    );
  }

  render() {
    const { searchBottomBar } = this.props;
    return (
      <div className="project-text-search">
        <div className="header">
          {this.renderInput()}
          {searchBottomBar}
        </div>
        {this.renderResults()}
      </div>
    );
  }
}

TextSearch.propTypes = {
  sources: PropTypes.object,
  results: PropTypes.array,
  query: PropTypes.string,
  closeActiveSearch: PropTypes.func,
  searchSources: PropTypes.func,
  selectSource: PropTypes.func,
  searchBottomBar: PropTypes.object
};

TextSearch.contextTypes = {
  shortcuts: PropTypes.object
};

TextSearch.displayName = "TextSearch";
