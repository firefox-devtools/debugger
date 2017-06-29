// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import { getSources, getActiveSearchState } from "../../selectors";
import { endTruncateStr } from "../../utils/utils";
import { parse as parseURL } from "url";
import { isPretty } from "../../utils/source";
import { isEnabled } from "devtools-config";
import { searchSource } from "../../utils/search/project-search";
import "./ProjectSearch.css";

import _Autocomplete from "../shared/Autocomplete";
const Autocomplete = createFactory(_Autocomplete);

import _TextSearch from "./TextSearch";
const TextSearch = createFactory(_TextSearch);

import type { Source } from "debugger-html";
import type { SourcesMap } from "../../reducers/sources";

function getSourcePath(source: Source) {
  if (!source.url) {
    return "";
  }

  const { path, href } = parseURL(source.url);
  // for URLs like "about:home" the path is null so we pass the full href
  return path || href;
}

function searchResults(sources: SourcesMap, query) {
  if (isEnabled("projectTextSearch")) {
    return projectSearchResults(sources, query);
  }

  return fileSearchResults(sources);
}

function fileSearchResults(sourceMap: SourcesMap) {
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

function projectSearchResults(sources, query) {
  return sources.valueSeq().toJS().map(source =>
    searchSource(source, query).map(result => ({
      value: result.match,
      title: result.text,
      subtitle: endTruncateStr(getSourcePath(source), 100),
      id: `${result.text}/${result.line}/${result.column}`
    }))
  );
}

class ProjectSearch extends Component {
  state: Object;
  toggleProjectSearch: Function;
  onEscape: Function;
  close: Function;

  constructor(props) {
    super(props);

    this.state = {
      inputValue: ""
    };

    this.toggleProjectSearch = this.toggleProjectSearch.bind(this);
    this.onEscape = this.onEscape.bind(this);
    this.close = this.close.bind(this);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    const searchKeys = [
      L10N.getStr("sources.search.key2"),
      L10N.getStr("sources.search.key2")
    ];
    searchKeys.forEach(key => shortcuts.off(key, this.toggleProjectSearch));
    shortcuts.off("Escape", this.onEscape);
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    const searchKeys = [
      L10N.getStr("sources.search.key2"),
      L10N.getStr("sources.search.alt.key")
    ];
    searchKeys.forEach(key => shortcuts.on(key, this.toggleProjectSearch));
    shortcuts.on("Escape", this.onEscape);
  }

  toggleProjectSearch(key, e) {
    e.preventDefault();
    if (this.props.searchOn) {
      return this.props.toggleActiveSearch();
    }
    return this.props.toggleActiveSearch("project");
  }

  onEscape(shortcut, e) {
    if (this.props.searchOn) {
      e.preventDefault();
      this.close();
    }
  }

  close() {
    this.setState({ inputValue: "" });
    this.props.toggleActiveSearch();
  }

  renderFileSearch() {
    return Autocomplete({
      selectItem: (e, result) => {
        this.props.selectSource(result.id);
        this.close();
      },
      close: this.close,
      items: searchResults(this.props.sources, this.state.inputValue),
      inputValue: this.state.inputValue,
      placeholder: L10N.getStr("sourceSearch.search"),
      size: "big"
    });
  }

  renderTextSearch() {
    const { sources } = this.props;

    return TextSearch({
      sources
    });
  }

  render() {
    const { searchOn } = this.props;
    if (!searchOn) {
      return null;
    }

    return dom.div(
      { className: "search-container" },
      isEnabled("projectTextSearch")
        ? this.renderTextSearch()
        : this.renderFileSearch()
    );
  }
}

ProjectSearch.propTypes = {
  sources: PropTypes.object.isRequired,
  selectSource: PropTypes.func.isRequired,
  toggleActiveSearch: PropTypes.func.isRequired,
  searchOn: PropTypes.bool
};

ProjectSearch.contextTypes = {
  shortcuts: PropTypes.object
};

ProjectSearch.displayName = "ProjectSearch";

export default connect(
  state => ({
    sources: getSources(state),
    searchOn: getActiveSearchState(state) === "project"
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(ProjectSearch);
