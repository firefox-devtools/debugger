const React = require("react");
const { DOM: dom, PropTypes } = React;
const { filter } = require("fuzzaldrin-plus");
const classnames = require("classnames");
const Svg = require("./Svg");
const CloseButton = require("./Button/Close");

require("./Autocomplete.css");

const INITIAL_SELECTED_INDEX = 0;

const Autocomplete = React.createClass({
  propTypes: {
    selectItem: PropTypes.func,
    items: PropTypes.array,
    close: PropTypes.func,
    inputValue: PropTypes.string
  },

  displayName: "Autocomplete",

  getInitialState() {
    return {
      inputValue: this.props.inputValue,
      selectedIndex: INITIAL_SELECTED_INDEX
    };
  },

  componentDidMount() {
    const endOfInput = this.state.inputValue.length;
    this.refs.searchInput.focus();
    this.refs.searchInput.setSelectionRange(endOfInput, endOfInput);
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

  onKeyDown(e) {
    const searchResults = this.getSearchResults(),
      resultCount = searchResults.length;

    if (e.key === "ArrowUp") {
      this.setState({
        selectedIndex: Math.max(0, this.state.selectedIndex - 1)
      });
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      this.setState({
        selectedIndex: Math.min(resultCount - 1, this.state.selectedIndex + 1)
      });
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

  renderSearchItem(result, index) {
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

  renderInput() {
    return dom.input(
      {
        ref: "searchInput",
        value: this.state.inputValue,
        onChange: (e) => this.setState({
          inputValue: e.target.value,
          selectedIndex: INITIAL_SELECTED_INDEX
        }),
        onFocus: e => this.setState({ focused: true }),
        onBlur: e => this.setState({ focused: false }),
        onKeyDown: this.onKeyDown,
        placeholder: L10N.getStr("sourceSearch.search1")
      }
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

  renderSummary(searchResults) {
    if (searchResults && searchResults.length === 0) {
      return;
    }

    let resultCountSummary = "";
    if (this.state.inputValue) {
      resultCountSummary = L10N.getFormatStr(
        "sourceSearch1.resultsSummary",
        searchResults.length,
        this.state.inputValue);
    }
    return dom.div({ className: "results-summary" }, resultCountSummary);
  },

  render() {
    const searchResults = this.getSearchResults();
    return dom.div(
      { className:
        classnames({
          autocomplete: true,
          focused: this.state.focused
        })
      },
      dom.div({ className: "searchinput-container" },
      Svg("magnifying-glass"),
      this.renderInput(),
      CloseButton({
        buttonClass: "big",
        handleClick: e => this.props.close()
      })),
      this.renderSummary(searchResults),
      this.renderResults(searchResults));
  }
});

module.exports = Autocomplete;
