// @flow

import React, { Component } from "react";
import { filter } from "fuzzaldrin-plus";
import classnames from "classnames";
import { scrollList } from "../../utils/result-list";
import "./Autocomplete.css";

import SearchInput from "./SearchInput";
import ResultList from "./ResultList";

type State = {
  inputValue: string,
  selectedIndex: number,
  focused: boolean
};

type Props = {
  selectItem: (event: SyntheticKeyboardEvent<>, item: Object) => void,
  onSelectedItem: (selectedItem: Object) => void,
  items: Array<Object>,
  close: (value: any) => void,
  inputValue: string,
  placeholder: string,
  size: string,
  children: any
};

export default class Autocomplete extends Component<> {
  static defaultProps: Object;

  constructor(props: Props) {
    super(props);

    (this: any).onKeyDown = this.onKeyDown.bind(this);
    this.state = {
      inputValue: props.inputValue,
      selectedIndex: 0,
      focused: false
    };
  }

  componentDidUpdate() {
    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedIndex);
    }
  }

  getSearchResults() {
    let inputValue = this.state.inputValue;

    if (inputValue == "") {
      return [];
    }

    return filter(this.props.items, this.state.inputValue, {
      key: "value"
    });
  }

  onKeyDown(e: SyntheticKeyboardEvent<>) {
    const searchResults = this.getSearchResults(),
      resultCount = searchResults.length;

    if (e.key === "ArrowUp") {
      const selectedIndex = Math.max(0, this.state.selectedIndex - 1);
      this.setState({ selectedIndex });
      if (this.props.onSelectedItem) {
        this.props.onSelectedItem(searchResults[selectedIndex]);
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      const selectedIndex = Math.min(
        resultCount - 1,
        this.state.selectedIndex + 1
      );
      this.setState({ selectedIndex });
      if (this.props.onSelectedItem) {
        this.props.onSelectedItem(searchResults[selectedIndex]);
      }
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (searchResults.length) {
        this.props.selectItem(e, searchResults[this.state.selectedIndex]);
      } else {
        this.props.close(this.state.inputValue);
      }
      e.preventDefault();
    } else if (e.key === "Tab") {
      this.props.close(this.state.inputValue);
      e.preventDefault();
    }
  }

  renderResults(results: Object[]) {
    const { size } = this.props;

    if (results.length) {
      const props = {
        items: results,
        selected: this.state.selectedIndex,
        selectItem: this.props.selectItem,
        close: this.props.close,
        size,
        ref: "resultList"
      };

      return <ResultList {...props} />;
    } else if (this.state.inputValue && !results.length) {
      return (
        <div className="no-result-msg absolute-center">
          {L10N.getStr("sourceSearch.noResults2")}
        </div>
      );
    }
  }

  render() {
    const { focused } = this.state;
    const { size, children } = this.props;
    const searchResults = this.getSearchResults();
    const summaryMsg = L10N.getFormatStr(
      "sourceSearch.resultsSummary1",
      searchResults.length
    );

    const searchProps = {
      query: this.state.inputValue,
      count: searchResults.length,
      placeholder: this.props.placeholder,
      size,
      showErrorEmoji: true,
      summaryMsg,
      onChange: e =>
        this.setState({
          inputValue: e.target.value,
          selectedIndex: 0
        }),
      onFocus: () => this.setState({ focused: true }),
      onBlur: () => this.setState({ focused: false }),
      onKeyDown: this.onKeyDown,
      handleClose: this.props.close
    };

    return (
      <div className={classnames("autocomplete", { focused })}>
        <SearchInput {...searchProps} />
        {children}
        {this.renderResults(searchResults)}
      </div>
    );
  }
}

Autocomplete.defaultProps = {
  size: ""
};
Autocomplete.displayName = "Autocomplete";
