// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import { isEnabled } from "devtools-config";
import {
  getSources,
  getActiveSearchState,
  getSearchResults,
  getQuery
} from "../../selectors";

import "./ProjectSearch.css";

import _TextSearch from "./TextSearch";
const TextSearch = createFactory(_TextSearch);

import _SourceSearch from "./SourceSearch";
const SourceSearch = createFactory(_SourceSearch);

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
    const { closeActiveSearch, addTab, closeTab, setActiveSearch } = this.props;
    e.preventDefault();

    if (!isEnabled("projectTextSearch")) {
      return;
    }

    if (this.isProjectSearchEnabled()) {
      closeTab();
      return closeActiveSearch();
    }

    addTab(
      {
        id: "project",
        isBlackBoxed: false,
        isPrettyPrinted: false,
        sourceMapURL: null,
        url: "project"
      },
      0
    );

    return setActiveSearch("project");
  }

  toggleSourceSearch(key, e) {
    const { closeActiveSearch, addTab, closeTab, setActiveSearch } = this.props;
    e.preventDefault();

    if (this.isSourceSearchEnabled()) {
      closeTab();
      return closeActiveSearch();
    }

    addTab(
      {
        id: "source",
        isBlackBoxed: false,
        isPrettyPrinted: false,
        sourceMapURL: null,
        url: "source"
      },
      0
    );
    return setActiveSearch("source");
  }

  isProjectSearchEnabled() {
    return this.props.activeSearch === "project";
  }

  isSourceSearchEnabled() {
    return this.props.activeSearch === "source";
  }

  renderSourceSearch() {
    const { sources, selectSource, closeActiveSearch } = this.props;
    return SourceSearch({ sources, selectSource, closeActiveSearch });
  }

  renderTextSearch() {
    const {
      sources,
      results,
      searchSources,
      closeActiveSearch,
      selectSource,
      query
    } = this.props;

    return TextSearch({
      sources,
      results: results.valueSeq().toJS(),
      searchSources,
      closeActiveSearch,
      selectSource,
      query
    });
  }

  render() {
    if (!(this.isProjectSearchEnabled() || this.isSourceSearchEnabled())) {
      return null;
    }

    return dom.div(
      { className: "search-container" },
      this.isProjectSearchEnabled()
        ? this.renderTextSearch()
        : this.renderSourceSearch()
    );
  }
}

ProjectSearch.propTypes = {
  sources: PropTypes.object.isRequired,
  results: PropTypes.object,
  query: PropTypes.string,
  setActiveSearch: PropTypes.func.isRequired,
  closeActiveSearch: PropTypes.func.isRequired,
  searchSources: PropTypes.func,
  activeSearch: PropTypes.string,
  selectSource: PropTypes.func.isRequired,
  addTab: PropTypes.func,
  closeTab: PropTypes.func
};

ProjectSearch.contextTypes = {
  shortcuts: PropTypes.object
};

ProjectSearch.displayName = "ProjectSearch";

export default connect(
  state => ({
    sources: getSources(state),
    activeSearch: getActiveSearchState(state),
    results: getSearchResults(state),
    query: getQuery(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(ProjectSearch);
