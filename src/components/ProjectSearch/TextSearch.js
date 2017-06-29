import { Component, DOM as dom, createFactory } from "react";
import classnames from "classnames";

import Svg from "../shared/Svg";
import _ManagedTree from "../shared/ManagedTree";
const ManagedTree = createFactory(_ManagedTree);

import _SearchInput from "../shared/SearchInput";
const SearchInput = createFactory(_SearchInput);

import { searchSources } from "../../utils/search";

import "./TextSearch.css";

export default class TextSearch extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      results: [],
      inputValue: props.inputValue || "",
      selectedIndex: 0,
      focused: false
    };
  }

  async inputOnChange(e) {
    const { sources } = this.props;
    const inputValue = e.target.value;
    const validSources = sources.valueSeq().filter(s => s.has("text")).toJS();
    const results = await searchSources(inputValue, validSources);

    this.setState({
      results,
      inputValue,
      selectedIndex: 0
    });
  }

  renderFile(file, expanded) {
    return dom.div(
      {
        className: "file-result",
        key: file.filepath
      },
      Svg("arrow", {
        className: classnames({
          expanded
        })
      }),
      file.filepath
    );
  }

  renderMatch(match) {
    return dom.div(
      { className: "result", key: `${match.line}/${match.column}` },
      dom.span(
        {
          className: "line-number"
        },
        match.line
      ),
      dom.span({ className: "line-match" }, match.value)
    );
  }

  renderResults() {
    const { results } = this.state;
    return ManagedTree({
      getRoots: () => results,
      getChildren: file => {
        return file.matches || [];
      },
      itemHeight: 20,
      autoExpand: 1,
      autoExpandDepth: 1,
      getParent: item => null,
      getKey: item => item.filepath || `${item.value}/${item.line}`,
      renderItem: (item, depth, focused, _, expanded) =>
        item.filepath ? this.renderFile(item, expanded) : this.renderMatch(item)
    });
  }

  resultCount() {
    const { results } = this.state;
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
      onKeyDown: this.onKeyDown,
      handleClose: this.props.close
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

TextSearch.displayName = "TextSearch";
