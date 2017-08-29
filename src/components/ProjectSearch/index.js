// @flow

import React, { PropTypes, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";

import TextSearch from "./TextSearch";
import SourceSearch from "./SourceSearch";
import ToggleSearch from "./ToggleSearch";

import { prefs } from "../../utils/prefs";
import {
  getSources,
  getActiveSearchState,
  getTextSearchResults,
  getTextSearchQuery,
  getSourceSearchQueryString
} from "../../selectors";

import "./ProjectSearch.css";

class ProjectSearch extends Component {
  state: Object;
  onEscape: Function;
  close: Function;
  toggleProjectTextSearch: Function;
  toggleSourceSearch: Function;

  constructor(props) {
    super(props);

    this.toggleSourceSearch = this.toggleSourceSearch.bind(this);
    this.toggleProjectTextSearch = this.toggleProjectTextSearch.bind(this);
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;

    shortcuts.on(
      L10N.getStr("projectTextSearch.key"),
      this.toggleProjectTextSearch
    );

    const searchKeys = [
      L10N.getStr("sources.search.key2"),
      L10N.getStr("sources.search.alt.key")
    ];
    searchKeys.forEach(key => shortcuts.on(key, this.toggleSourceSearch));
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off(
      L10N.getStr("projectTextSearch.key"),
      this.toggleProjectTextSearch
    );

    const searchKeys = [
      L10N.getStr("sources.search.key2"),
      L10N.getStr("sources.search.alt.key")
    ];
    searchKeys.forEach(key => shortcuts.off(key, this.toggleSourceSearch));
    shortcuts.off("Escape", this.onEscape);
  }

  toggleProjectTextSearch(key, e) {
    const { closeActiveSearch, setActiveSearch } = this.props;
    if (e) {
      e.preventDefault();
    }

    if (!prefs.projectTextSearchEnabled) {
      return;
    }

    if (this.isProjectSearchEnabled()) {
      return closeActiveSearch();
    }
    return setActiveSearch("project");
  }

  toggleSourceSearch(key, e) {
    const { closeActiveSearch, setActiveSearch } = this.props;
    if (e) {
      e.preventDefault();
    }

    if (this.isSourceSearchEnabled()) {
      return closeActiveSearch();
    }
    return setActiveSearch("source");
  }

  isProjectSearchEnabled() {
    return this.props.activeSearch === "project";
  }

  isSourceSearchEnabled() {
    return this.props.activeSearch === "source";
  }

  renderSourceSearch() {
    const {
      sources,
      selectSource,
      closeActiveSearch,
      sourceSearchQueryString,
      setSourceSearchQueryString,
      clearSourceSearchQueryString
    } = this.props;
    return (
      <SourceSearch
        sources={sources}
        selectSource={selectSource}
        closeActiveSearch={closeActiveSearch}
        clearSourceSearchQueryString={clearSourceSearchQueryString}
        searchBottomBar={
          <ToggleSearch kind="sources" toggle={this.toggleProjectTextSearch} />
        }
        queryString={sourceSearchQueryString}
        queryStringChangeHandler={setSourceSearchQueryString}
      />
    );
  }

  renderTextSearch() {
    const {
      sources,
      results,
      searchSources,
      closeActiveSearch,
      selectSource,
      textSearchQueryString
    } = this.props;

    return (
      <TextSearch
        sources={sources}
        results={results.valueSeq().toJS()}
        searchSources={searchSources}
        closeActiveSearch={closeActiveSearch}
        selectSource={selectSource}
        query={textSearchQueryString}
        searchBottomBar={
          <ToggleSearch kind="project" toggle={this.toggleSourceSearch} />
        }
      />
    );
  }

  render() {
    if (!(this.isProjectSearchEnabled() || this.isSourceSearchEnabled())) {
      return null;
    }

    return (
      <div className="search-container">
        {this.isProjectSearchEnabled()
          ? this.renderTextSearch()
          : this.renderSourceSearch()}
      </div>
    );
  }
}

ProjectSearch.propTypes = {
  sources: PropTypes.object.isRequired,
  results: PropTypes.object,
  textSearchQueryString: PropTypes.string,
  setActiveSearch: PropTypes.func.isRequired,
  closeActiveSearch: PropTypes.func.isRequired,
  searchSources: PropTypes.func,
  activeSearch: PropTypes.string,
  selectSource: PropTypes.func.isRequired
};

ProjectSearch.contextTypes = {
  shortcuts: PropTypes.object
};

ProjectSearch.displayName = "ProjectSearch";

export default connect(
  state => ({
    sources: getSources(state),
    activeSearch: getActiveSearchState(state),
    results: getTextSearchResults(state),
    textSearchQueryString: getTextSearchQuery(state),
    sourceSearchQueryString: getSourceSearchQueryString(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(ProjectSearch);
