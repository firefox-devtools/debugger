// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../actions";
import {
  getSources, getSelectedSource, getProjectSearchState
} from "../selectors";
import { endTruncateStr } from "../utils/utils";
import { parse as parseURL } from "url";
import { isPretty } from "../utils/source";
import "./SourceSearch.css";

const Autocomplete = createFactory(require("./shared/Autocomplete"));

function searchResults(sources) {
  function getSourcePath(source) {
    const { path, href } = parseURL(source.get("url"));
    // for URLs like "about:home" the path is null so we pass the full href
    return (path || href);
  }

  return sources.valueSeq()
    .filter(source => !isPretty(source.toJS()) && source.get("url"))
    .map(source => ({
      value: getSourcePath(source),
      title: getSourcePath(source).split("/").pop(),
      subtitle: endTruncateStr(getSourcePath(source), 100),
      id: source.get("id")
    }))
    .toJS();
}

class Search extends Component {

  state: Object
  toggle: Function
  onEscape: Function
  close: Function

  constructor(props) {
    super(props);
    this.state = {
      inputValue: ""
    };

    this.toggle = this.toggle.bind(this);
    this.onEscape = this.onEscape.bind(this);
    this.close = this.close.bind(this);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    const searchKeys = [
      L10N.getStr("sources.search.key"),
      L10N.getStr("sources.searchAlt.key")
    ];
    searchKeys.forEach(key => shortcuts.off(`CmdOrCtrl+${key}`, this.toggle));
    shortcuts.off("Escape", this.onEscape);
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    const searchKeys = [
      L10N.getStr("sources.search.key"),
      L10N.getStr("sources.searchAlt.key")
    ];
    searchKeys.forEach(key => shortcuts.on(`CmdOrCtrl+${key}`, this.toggle));
    shortcuts.on("Escape", this.onEscape);
  }

  toggle(key, e) {
    e.preventDefault();
    this.props.toggleProjectSearch();
  }

  onEscape(shortcut, e) {
    if (this.props.searchOn) {
      e.preventDefault();
      this.setState({ inputValue: "" });
      this.props.toggleProjectSearch(false);
    }
  }

  close(inputValue = "") {
    this.setState({ inputValue });
    this.props.toggleProjectSearch(false);
  }

  render() {
    if (!this.props.searchOn) {
      return null;
    }

    return dom.div({ className: "search-container" },
      Autocomplete({
        selectItem: result => {
          this.props.selectSource(result.id);
          this.close();
        },
        close: this.close,
        items: searchResults(this.props.sources),
        inputValue: this.state.inputValue,
        placeholder: L10N.getStr("sourceSearch.search"),
        size: "big"
      }));
  }

}

Search.propTypes = {
  sources: PropTypes.object.isRequired,
  selectSource: PropTypes.func.isRequired,
  selectedSource: PropTypes.object,
  toggleProjectSearch: PropTypes.func.isRequired,
  searchOn: PropTypes.bool
};

Search.contextTypes = {
  shortcuts: PropTypes.object
};

Search.displayName = "Search";

export default connect(
  state => ({
    sources: getSources(state),
    selectedSource: getSelectedSource(state),
    searchOn: getProjectSearchState(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Search);
