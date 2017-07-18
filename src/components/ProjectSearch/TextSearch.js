import { Component, DOM as dom, createFactory, PropTypes } from "react";
import classnames from "classnames";

import escapeRegExp from "lodash/escapeRegExp";
import Svg from "../shared/Svg";
import _ManagedTree from "../shared/ManagedTree";
const ManagedTree = createFactory(_ManagedTree);

import _SearchInput from "../shared/SearchInput";
const SearchInput = createFactory(_SearchInput);

import "./TextSearch.css";

export default class TextSearch extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      //results: [],
      inputValue: ""
      //selectedIndex: 0,
      //focused: false
    };

    this.inputOnChange = this.inputOnChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.close = this.close.bind(this);
  }

  close() {
    //this.setState({ inputValue: "", results: [], selectedIndex: 0 });
    this.props.closeActiveSearch();
  }

  componentDidMount() {
    this.props.loadAllSources();
  }

  async onKeyDown(e) {
    if (e.key !== "Enter") {
      return;
    }
    this.props.searchSources(this.state.inputValue);

    /*this.setState({
      results,
      inputValue,
      selectedIndex: 0
    });*/
  }

  inputOnChange(e) {
    const inputValue = e.target.value;
    this.setState({ inputValue });
  }

  renderFile(file, focused, expanded, setExpanded) {
    if (file.matches.length === 0) {
      return null;
    }
    return dom.div(
      {
        className: classnames("file-result", { focused }),
        key: file.filepath,
        onClick: e => setExpanded(file, !expanded)
      },
      Svg("arrow", {
        className: classnames({
          expanded
        })
      }),
      dom.span({ className: "file-path" }, file.filepath),
      dom.span(
        { className: "matches-summary", key: `m-${file.filepath}` },
        ` (${file.matches.length} match${file.matches.length > 1 ? "es" : ""})`
      )
    );
  }

  renderMatch(match, focused) {
    return dom.div(
      {
        className: classnames("result", { focused }),
        key: `${match.filepath}-${match.line}-${match.column}`,
        onClick: () => console.log(`clicked ${match}`)
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
    return ManagedTree({
      getRoots: () => this.props.results,
      getChildren: file => {
        return file.matches || [];
      },
      itemHeight: 20,
      autoExpand: 1,
      autoExpandDepth: 1,
      getParent: item => null,
      getKey: item =>
        item.filepath || `${item.value}-${item.line}-${item.column}`,
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
      handleClose: this.close
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
  loadAllSources: PropTypes.func,
  searchSources: PropTypes.func
};

TextSearch.displayName = "TextSearch";
