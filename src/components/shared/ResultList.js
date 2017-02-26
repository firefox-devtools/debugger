// @flow
const React = require("react");
const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");

require("./ResultList.css");

type ResultListItem = {
    id: string,
    subtitle: string,
    title: string,
    value: string
};

const ResultList = React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired,
    selected: PropTypes.number.isRequired,
    selectItem: PropTypes.func.isRequired,
  },

  displayName: "ResultList",

  renderListItem(item: ResultListItem, index: number) {
    return dom.li(
      {
        onClick: () => this.props.selectItem(item),
        key: `${item.id}${item.value}`,
        title: item.value,
        className: classnames({
          selected: index === this.props.selected
        })
      },
      dom.div({ className: "title" }, item.title),
      dom.div({ className: "subtitle" }, item.subtitle)
    );
  },

  render() {
    return dom.ul({ className: "result-list" },
    this.props.items.map(this.renderListItem));
  }
});

module.exports = ResultList;
