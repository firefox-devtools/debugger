// @flow

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { filter } from "fuzzaldrin-plus";

import actions from "../actions";
import {
  getSources,
  getActiveSearch,
  getSourceSearchQuery
} from "../selectors";
import { endTruncateStr } from "../utils/utils";
import { scrollList } from "../utils/result-list";
import { isPretty, getSourcePath, isThirdParty } from "../utils/source";
import Modal from "./shared/Modal";
import SearchInput from "./shared/SearchInput";
import ResultList from "./shared/ResultList";

import type { SourcesMap } from "../reducers/sources";

function formatResults(sources: SourcesMap) {
  return sources
    .valueSeq()
    .toJS()
    .filter(source => !isPretty(source) && !isThirdParty(source))
    .map(source => ({
      value: getSourcePath(source),
      title: getSourcePath(source)
        .split("/")
        .pop(),
      subtitle: endTruncateStr(getSourcePath(source), 100),
      id: source.id
    }))
    .filter(formattedSource => formattedSource.value != "");
}

type Props = {
  enabled: boolean,
  sources: Array<Object>,
  query: string,
  selectSource: (id: string) => void,
  setSourceSearchQuery: (query: string) => void,
  closeActiveSearch: () => void
};

type State = {
  results: ?Array<Object>,
  selectedIndex: number
};

class SourcesModal extends Component {
  props: Props;
  state: State;
  constructor(props) {
    super(props);
    this.state = { results: null, selectedIndex: 0 };
  }

  componentDidMount() {
    this.searchSources(this.props.query);
  }

  componentDidUpdate(prevProps: any) {
    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedIndex);
    }

    if (!prevProps.enabled && this.props.enabled) {
      this.searchSources(this.props.query);
    }
  }

  closeModal = () => {
    this.props.closeActiveSearch();
  };

  searchSources = (query: string) => {
    if (query == "") {
      this.setState({ results: this.props.sources });
      return;
    }
    this.setState({
      results: filter(this.props.sources, query, { key: "value" })
    });
  };

  resultCount() {
    return this.state.results ? this.state.results.length : 0;
  }

  selectResultItem = (e: SyntheticEvent, result) => {
    const { selectSource } = this.props;

    if (!result) {
      return;
    }

    selectSource(result.id);

    this.closeModal();
  };

  traverseResults = (direction: number) => {
    const { selectedIndex } = this.state;
    const resultCount = this.resultCount();
    const index = selectedIndex + direction;
    const nextIndex = (index + resultCount) % resultCount;

    this.setState({ selectedIndex: nextIndex });
  };

  onChange = (e: SyntheticInputEvent) => {
    this.props.setSourceSearchQuery(e.target.value);
    this.searchSources(e.target.value);
  };

  onKeyDown = (e: SyntheticKeyboardEvent) => {
    const { enabled } = this.props;
    const { results, selectedIndex } = this.state;

    if (!enabled || !results) {
      return;
    }

    if (e.key === "ArrowUp") {
      this.traverseResults(-1);
    } else if (e.key === "ArrowDown") {
      this.traverseResults(1);
    } else if (e.key === "Enter") {
      this.selectResultItem(e, results[selectedIndex]);
      this.closeModal();
    } else if (e.key === "Tab") {
      this.closeModal();
    }
  };

  renderResults = () => {
    const { selectedIndex, results } = this.state;

    const { enabled } = this.props;
    if (!enabled || !results) {
      return null;
    }

    return (
      <ResultList
        key="results"
        items={results}
        selected={selectedIndex}
        selectItem={this.selectResultItem}
        ref="resultList"
        size="big"
      />
    );
  };

  renderInput() {
    const { query } = this.props;
    const summaryMsg = L10N.getFormatStr(
      "sourceSearch.resultsSummary1",
      this.resultCount()
    );

    return (
      <div key="input" className="input-wrapper">
        <SearchInput
          query={query}
          count={this.resultCount()}
          placeholder={L10N.getStr("sourceSearch.search")}
          summaryMsg={summaryMsg}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          handleClose={this.closeModal}
        />
      </div>
    );
  }
  render() {
    const { enabled } = this.props;

    if (!enabled) {
      return null;
    }

    return (
      <Modal in={enabled} handleClose={this.closeModal}>
        {this.renderInput()}
        {this.renderResults()}
      </Modal>
    );
  }
}

SourcesModal.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => ({
    enabled: getActiveSearch(state) === "source",
    sources: formatResults(getSources(state)),
    query: getSourceSearchQuery(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SourcesModal);
