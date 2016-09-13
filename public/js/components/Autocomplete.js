const React = require("react");
const { DOM: dom, PropTypes } = React;
const { filter } = require("fuzzaldrin-plus");
const classnames = require("classnames");
require("./Autocomplete.css");
const Svg = require("./utils/Svg");

const INITIAL_SELECTED_INDEX = 0;

const Autocomplete = React.createClass({
  propTypes: {
    selectItem: PropTypes.func,
    items: PropTypes.array
  },

  displayName: "Autocomplete",

  getInitialState() {
    return {
      inputValue: "",
      selectedIndex: INITIAL_SELECTED_INDEX
    };
  },

  componentDidMount() {
    this.refs.searchInput.focus();
  },

  componentDidUpdate() {
    this.scrollList();
  },

  scrollList() {
    const resultsEl = this.refs.results;
    if (resultsEl.children.length === 0) {
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

  renderSearchItem(result, index) {
    return dom.li(
      {
        onClick: () => this.props.selectItem(result),
        key: result.value,
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
        onChange: (e) => this.setState({
          inputValue: e.target.value,
          selectedIndex: INITIAL_SELECTED_INDEX
        }),
        onFocus: e => this.setState({ focused: true }),
        onBlur: e => this.setState({ focused: false }),
        onKeyDown: this.onKeyDown,
        placeholder: "Search..."
      }
    );
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
      this.props.selectItem(searchResults[this.state.selectedIndex]);
      e.preventDefault();
    }
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
      new Svg("magnifying-glass"),
      this.renderInput(),
      dom.ul({ className: "results", ref: "results" },
        searchResults.map(this.renderSearchItem)
      )
    );
  }
});

module.exports = Autocomplete;
