/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";

import TextSearch from "./TextSearch";

import {
  getSources,
  getActiveSearch,
  getTextSearchResults,
  getTextSearchQuery
} from "../../selectors";

import "./ProjectSearch.css";

type Props = {
  sources: Object,
  results: Object,
  textSearchQuery: string,
  setActiveSearch: Function,
  closeActiveSearch: Function,
  searchSources: Function,
  activeSearch: string,
  selectSource: Function
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
      searchSources,
      closeActiveSearch,
      selectSource,
      textSearchQuery
    } = this.props;

    return (
      <TextSearch
        sources={sources}
        results={results.toJS()}
        searchSources={searchSources}
        closeActiveSearch={closeActiveSearch}
        selectSource={selectSource}
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

ProjectSearch.propTypes = {
  sources: PropTypes.object.isRequired,
  results: PropTypes.object,
  textSearchQuery: PropTypes.string,
  setActiveSearch: PropTypes.func.isRequired,
  closeActiveSearch: PropTypes.func.isRequired,
  searchSources: PropTypes.func,
  activeSearch: PropTypes.string,
  selectSource: PropTypes.func.isRequired
};

ProjectSearch.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => ({
    sources: getSources(state),
    activeSearch: getActiveSearch(state),
    results: getTextSearchResults(state),
    textSearchQuery: getTextSearchQuery(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(ProjectSearch);
