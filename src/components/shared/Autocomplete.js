// @flow
const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { findDOMNode } = require("react-dom");
const { filter } = require("fuzzaldrin-plus");
const classnames = require("classnames");
const Svg = require("./Svg");
const SearchInput = createFactory(require("./SearchInput"));

require("./Autocomplete.css");

const INITIAL_SELECTED_INDEX = 0;
const INITIAL_FOCUSED = false;

type SearchItemResult = {
    id: string,
    subtitle: string,
    title: string,
    value: string
};

const Autocomplete = React.createClass({
  propTypes: {
    selectItem: PropTypes.func.isRequired,
    onSelectedItem: PropTypes.func,
    items: PropTypes.array,
    close: PropTypes.func.isRequired,
    inputValue: PropTypes.string.isRequired,
    placeholder: PropTypes.string
  },

  displayName: "Autocomplete",

  getInitialState() {
    return {
      inputValue: this.props.inputValue,
      selectedIndex: INITIAL_SELECTED_INDEX,
      focused: INITIAL_FOCUSED
    };
  },

  componentDidMount() {
    const endOfInput = this.state.inputValue.length;
    const searchInput = findDOMNode(this).querySelector("input");
    searchInput.focus();
    searchInput.setSelectionRange(endOfInput, endOfInput);
  },

  componentDidUpdate() {
    this.scrollList();
  },

  scrollList() {
    const resultsEl = this.refs.results;
    if (!resultsEl || resultsEl.children.length === 0) {
      return;
    }

    const resultsHeight = resultsEl.clientHeight;
    const itemHeight = resultsEl.children[0].clientHeight;
    const numVisible = resultsHeight / itemHeight;
    const positionsToScroll = this.state.selectedIndex - numVisible + 1;
    const itemOffset = resultsHeight % itemHeight;
    const scroll = positionsToScroll * (itemHeight + 2) + itemOffset;

    resultsEl.scrollTop = Math.max(0, scroll);
  },

  getSearchResults() {
    let inputValue = this.state.inputValue;

    if (inputValue == "") {
      return [];
    }
    return filter(this.props.items, this.state.inputValue, {
      key: "value"
    });
  },

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
  },

  renderSearchItem(result: SearchItemResult, index: number) {
    return dom.li(
      {
        onClick: () => this.props.selectItem(result),
        key: `${result.id}${result.value}`,
        title: result.value,
        className: classnames({
          selected: index === this.state.selectedIndex
        })
      },
      dom.div({ className: "title" }, result.title),
      dom.div({ className: "subtitle" }, result.subtitle)
    );
  },

  renderResults(results) {
    if (results.length) {
      return dom.ul({ className: "results", ref: "results" },
      results.map(this.renderSearchItem));
    } else if (this.state.inputValue && !results.length) {
      return dom.div({ className: "no-result-msg" },
        Svg("sad-face"),
        L10N.getFormatStr("sourceSearch.noResults", this.state.inputValue)
      );
    }
  },

  render() {
    const { focused } = this.state;
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
        summaryMsg,
        onChange: e => this.setState({
          inputValue: e.target.value,
          selectedIndex: INITIAL_SELECTED_INDEX
        }),
        onFocus: () => this.setState({ focused: true }),
        onBlur: () => this.setState({ focused: false }),
        onKeyDown: this.onKeyDown,
        handleClose: this.props.close
      }),
      this.renderResults(searchResults));
  }
});

module.exports = Autocomplete;
