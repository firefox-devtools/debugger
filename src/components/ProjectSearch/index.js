/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";

import TextSearch from "./TextSearch";

import {
  getSources,
  getActiveSearch,
  getTextSearchResults,
  getTextSearchStatus,
  getTextSearchQuery
} from "../../selectors";

import "./ProjectSearch.css";

type Props = {
  sources: Object,
  results: Object,
  textSearchQuery: string,
  setActiveSearch: Function,
  closeActiveSearch: Function,
  closeProjectSearch: Function,
  searchSources: Function,
  activeSearch: string,
  selectLocation: Function,
  status: string
};

class ProjectSearch extends Component<Props> {
  onEscape: Function;
  close: Function;
  toggleProjectTextSearch: Function;

  constructor(props) {
    super(props);
    this.toggleProjectTextSearch = this.toggleProjectTextSearch.bind(this);
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;

    shortcuts.on(
      L10N.getStr("projectTextSearch.key"),
      this.toggleProjectTextSearch
    );
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off(
      L10N.getStr("projectTextSearch.key"),
      this.toggleProjectTextSearch
    );
  }

  toggleProjectTextSearch(key, e) {
    const { closeActiveSearch, setActiveSearch } = this.props;
    if (e) {
      e.preventDefault();
    }

    if (this.isProjectSearchEnabled()) {
      return closeActiveSearch();
    }
    return setActiveSearch("project");
  }

  isProjectSearchEnabled() {
    return this.props.activeSearch === "project";
  }

  renderTextSearch() {
    const {
      sources,
      results,
      status,
      searchSources,
      closeProjectSearch,
      selectLocation,
      textSearchQuery
    } = this.props;

    return (
      <TextSearch
        sources={sources}
        results={results.toJS()}
        status={status}
        searchSources={searchSources}
        closeProjectSearch={closeProjectSearch}
        selectLocation={selectLocation}
        query={textSearchQuery}
      />
    );
  }

  render() {
    if (!this.isProjectSearchEnabled()) {
      return null;
    }

    return <div className="search-container">{this.renderTextSearch()}</div>;
  }
}

export default connect(
  state => ({
    sources: getSources(state),
    activeSearch: getActiveSearch(state),
    results: getTextSearchResults(state),
    textSearchQuery: getTextSearchQuery(state),
    status: getTextSearchStatus(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(ProjectSearch);
