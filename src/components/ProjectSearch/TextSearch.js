import { Component, DOM as dom, createFactory, PropTypes } from "react";
import classnames from "classnames";

import escapeRegExp from "lodash/escapeRegExp";
import Svg from "../shared/Svg";
import _ManagedTree from "../shared/ManagedTree";
const ManagedTree = createFactory(_ManagedTree);

import _SearchInput from "../shared/SearchInput";
const SearchInput = createFactory(_SearchInput);

import "./TextSearch.css";

import { getRelativePath } from "../../utils/sources-tree";

export default class TextSearch extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      inputValue: this.props.query || ""
    };

    this.inputOnChange = this.inputOnChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.close = this.close.bind(this);
    this.selectMatchItem = this.selectMatchItem.bind(this);
  }

  close() {
    this.props.closeActiveSearch();
  }

  async onKeyDown(e) {
    console.log(e.key);
    if (e.key !== "Enter") {
      return;
    }
    this.props.searchSources(this.state.inputValue);
  }

  componentDidMount() {
    if (this.refs.searchInput) {
      this.refs.searchInput.refs.input.focus();
    }
  }

  inputOnChange(e) {
    const inputValue = e.target.value;
    this.setState({ inputValue });
  }

  selectMatchItem(matchItem) {
    this.props.selectSource(matchItem.sourceId);
  }

  renderFile(file, focused, expanded, setExpanded) {
    return dom.div(
      {
        className: classnames("file-result", { focused }),
        key: file.id,
        onClick: e => setExpanded(file, !expanded)
      },
      Svg("arrow", {
        className: classnames({
          expanded
        })
      }),
      Svg("file"),
      dom.span({ className: "file-path" }, getRelativePath(file.filepath)),
      dom.span(
        { className: "matches-summary" },
        ` (${file.matches.length} match${file.matches.length > 1 ? "es" : ""})`
      )
    );
  }

  renderMatch(match, focused) {
    return dom.div(
      {
        className: classnames("result", { focused }),
        onClick: () => setTimeout(() => this.selectMatchItem(match), 50)
      },
      dom.span(
        {
          className: "line-number",
          key: `${match.line}`
        },
        match.line
      ),
      this.renderMatchValue(match.value)
    );
  }

  renderMatchValue(value) {
    const { inputValue } = this.state;
    let match;
    const len = inputValue.length;
    let matchIndexes = [];
    let matches = [];
    const re = new RegExp(escapeRegExp(inputValue), "g");
    while ((match = re.exec(value)) !== null) {
      matchIndexes.push(match.index);
    }

    matchIndexes.forEach((matchIndex, index) => {
      if (matchIndex > 0 && index === 0) {
        matches.push(
          dom.span({ className: "line-match" }, value.slice(0, matchIndex))
        );
      }
      if (matchIndex > matchIndexes[index - 1] + len) {
        matches.push(
          dom.span(
            { className: "line-match" },
            value.slice(matchIndexes[index - 1] + len, matchIndex)
          )
        );
      }
      matches.push(
        dom.span(
          { className: "query-match", key: index },
          value.substr(matchIndex, len)
        )
      );
      if (index === matchIndexes.length - 1) {
        matches.push(
          dom.span(
            {
              className: "line-match"
            },
            value.slice(matchIndex + len, value.length)
          )
        );
      }
    });

    return dom.span({ className: "line-value" }, ...matches);
  }

  renderResults() {
    const { results } = this.props;
    results = results.filter(result => result.matches.length > 0);
    return ManagedTree({
      getRoots: () => results,
      getChildren: file => {
        return file.matches || [];
      },
      itemHeight: 20,
      autoExpand: 1,
      autoExpandDepth: 1,
      focused: results[0],
      getParent: item => null,
      getKey: item =>
        item.filepath
          ? `${item.sourceId}`
          : `${item.sourceId}-${item.line}-${item.column}`,
      renderItem: (item, depth, focused, _, expanded, { setExpanded }) =>
        item.filepath
          ? this.renderFile(item, focused, expanded, setExpanded)
          : this.renderMatch(item, focused)
    });
  }

  resultCount() {
    const { results } = this.props;
    return results.reduce(
      (count, file) => count + (file.matches ? file.matches.length : 0),
      0
    );
  }

  renderInput() {
    const resultCount = this.resultCount();
    const summaryMsg = L10N.getFormatStr(
      "sourceSearch.resultsSummary1",
      resultCount
    );

    return SearchInput({
      query: this.state.inputValue,
      count: resultCount,
      placeholder: "Search Project",
      size: "big",
      summaryMsg,
      onChange: e => this.inputOnChange(e),
      onFocus: () => this.setState({ focused: true }),
      onBlur: () => this.setState({ focused: false }),
      onKeyDown: e => this.onKeyDown(e),
      handleClose: this.close,
      ref: "searchInput"
    });
  }

  render() {
    return dom.div(
      {
        className: "project-text-search"
      },
      this.renderInput(),
      this.renderResults()
    );
  }
}

TextSearch.propTypes = {
  addTab: PropTypes.func,
  sources: PropTypes.object,
  results: PropTypes.array,
  query: PropTypes.string,
  closeActiveSearch: PropTypes.func,
  searchSources: PropTypes.func,
  selectSource: PropTypes.func
};

TextSearch.displayName = "TextSearch";
