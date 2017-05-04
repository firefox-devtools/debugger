// @flow

import { Component, DOM as dom, PropTypes, createFactory } from "react";
import { filter } from "fuzzaldrin-plus";
import classnames from "classnames";
import { scrollList } from "../../utils/result-list";
import Svg from "./Svg";

const { findDOMNode } = require("react-dom");
const SearchInput = createFactory(require("./SearchInput").default);
const ResultList = createFactory(require("./ResultList").default);

import "./Autocomplete.css";
type State = {
  inputValue: string,
  selectedIndex: number,
  focused: boolean
};

export default class Autocomplete extends Component {
  state: State;
  static defaultProps: Object;

  constructor(props: any) {
    super(props);

    (this: any).onKeyDown = this.onKeyDown.bind(this);
    this.state = {
      inputValue: props.inputValue,
      selectedIndex: 0,
      focused: false
    };
  }

  componentDidMount() {
    const endOfInput = this.state.inputValue.length;
    const node = findDOMNode(this);
    if (node instanceof HTMLElement) {
      const searchInput = node.querySelector("input");
      if (searchInput instanceof HTMLInputElement) {
        searchInput.focus();
        searchInput.setSelectionRange(endOfInput, endOfInput);
      }
    }
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

  onKeyDown(e: SyntheticKeyboardEvent) {
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
        this.props.selectItem(searchResults[this.state.selectedIndex]);
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
      return ResultList({
        items: results,
        selected: this.state.selectedIndex,
        selectItem: this.props.selectItem,
        close: this.props.close,
        size,
        ref: "resultList"
      });
    } else if (this.state.inputValue && !results.length) {
      return dom.div(
        { className: "no-result-msg" },
        Svg("sad-face"),
        L10N.getFormatStr("sourceSearch.noResults", this.state.inputValue)
      );
    }
  }

  render() {
    const { focused } = this.state;
    const { size } = this.props;
    const searchResults = this.getSearchResults();
    const summaryMsg = L10N.getFormatStr(
      "sourceSearch.resultsSummary1",
      searchResults.length
    );
    return dom.div(
      { className: classnames("autocomplete", { focused }) },
      SearchInput({
        query: this.state.inputValue,
        count: searchResults.length,
        placeholder: this.props.placeholder,
        size,
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
      }),
      this.renderResults(searchResults)
    );
  }
}

Autocomplete.propTypes = {
  selectItem: PropTypes.func.isRequired,
  onSelectedItem: PropTypes.func,
  items: PropTypes.array,
  close: PropTypes.func.isRequired,
  inputValue: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  size: PropTypes.string
};

Autocomplete.displayName = "Autocomplete";

Autocomplete.defaultProps = {
  size: ""
};
