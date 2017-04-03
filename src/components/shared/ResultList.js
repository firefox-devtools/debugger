// @flow
import { DOM as dom, PropTypes, createClass } from "react";
import classnames from "classnames";

import "./ResultList.css";

type ResultListItem = {
  id: string,
  subtitle: string,
  title: string,
  value: string,
};

const ResultList = createClass({
  propTypes: {
    items: PropTypes.array.isRequired,
    selected: PropTypes.number.isRequired,
    selectItem: PropTypes.func.isRequired,
    size: PropTypes.string,
  },

  displayName: "ResultList",

  getDefaultProps() {
    return {
      size: "",
    };
  },

  renderListItem(item: ResultListItem, index: number) {
    return dom.li(
      {
        onClick: e => this.props.selectItem(e, item, index),
        key: `${item.id}${item.value}${index}`,
        ref: index,
        title: item.value,
        className: classnames({
          selected: index === this.props.selected,
        }),
      },
      dom.div({ className: "title" }, item.title),
      dom.div({ className: "subtitle" }, item.subtitle)
    );
  },

  render() {
    let { size } = this.props;
    size = size || "";
    return dom.ul(
      {
        className: `result-list ${size}`,
      },
      this.props.items.map(this.renderListItem)
    );
  },
});

export default ResultList;
