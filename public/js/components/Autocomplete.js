const React = require("react");
const { DOM: dom, PropTypes } = React;
const { filter } = require("fuzzaldrin-plus");
require("./Autocomplete.css");

const Autocomplete = React.createClass({
  propTypes: {
    selectItem: PropTypes.func,
    items: PropTypes.array
  },

  displayName: "Autocomplete",

  getInitialState() {
    return {
      inputValue: ""
    };
  },

  componentDidMount() {
    this.refs.searchInput.focus();
  },

  renderSearchItem(result) {
    return dom.li(
      {
        onClick: () => this.props.selectItem(result),
        key: result.value
      },
      dom.div({ className: "title" }, result.title),
      dom.div({ className: "subtitle" }, result.subtitle)
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

  render() {
    const searchResults = this.getSearchResults();

    return dom.div(
      { className: "autocomplete" },
      dom.input(
        {
          ref: "searchInput",
          onChange: (e) => this.setState({ inputValue: e.target.value })
        }
      ),
      dom.ul({ className: "results" },
        searchResults.map(this.renderSearchItem)
      )
    );
  }
});

module.exports = Autocomplete;
