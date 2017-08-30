// @flow
import React, { Component } from "react";
import classnames from "classnames";

import "./ResultList.css";

type ResultListItem = {
  id: string,
  subtitle: string,
  title: string,
  value: string
};

type Props = {
  items: Array<ResultListItem>,
  selected: number,
  selectItem: (
    event: SyntheticKeyboardEvent<>,
    item: ResultListItem,
    index: number
  ) => void,
  size: string
};

export default class ResultList extends Component<> {
  static defaultProps: Object;
  displayName: "ResultList";

  constructor(props: Props) {
    super(props);
    (this: any).renderListItem = this.renderListItem.bind(this);
  }

  renderListItem(item: ResultListItem, index: number) {
    const { selectItem, selected } = this.props;
    const props = {
      onClick: event => selectItem(event, item, index),
      key: `${item.id}${item.value}${index}`,
      ref: index,
      title: item.value,
      className: classnames("result-item", {
        selected: index === selected
      })
    };

    return (
      <li {...props}>
        <div className="title">
          {item.title}
        </div>
        <div className="subtitle">
          {item.subtitle}
        </div>
      </li>
    );
  }

  render() {
    let { size, items } = this.props;

    return (
      <ul className={classnames("result-list", size)}>
        {items.map(this.renderListItem)}
      </ul>
    );
  }
}

ResultList.defaultProps = {
  size: "small"
};
