/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import classnames from "classnames";

import "./ResultList.css";

type Props = {
  items: Array<any>,
  selected: number,
  selectItem: (
    event: SyntheticKeyboardEvent<HTMLElement>,
    item: any,
    index: number
  ) => void,
  size: string
};

export default class ResultList extends Component<Props> {
  displayName: "ResultList";

  static defaultProps = {
    size: "small"
  };

  constructor(props: Props) {
    super(props);
    (this: any).renderListItem = this.renderListItem.bind(this);
  }

  renderListItem(item: any, index: number) {
    const { selectItem, selected } = this.props;
    const props = {
      onClick: event => selectItem(event, item, index),
      key: `${item.id}${item.value}${index}`,
      ref: String(index),
      title: item.value,
      className: classnames("result-item", {
        selected: index === selected
      })
    };

    return (
      <li {...props}>
        <div className="title">{item.title}</div>
        <div className="subtitle">{item.subtitle}</div>
      </li>
    );
  }

  render() {
    const { size, items } = this.props;

    return (
      <ul className={classnames("result-list", size)}>
        {items.map(this.renderListItem)}
      </ul>
    );
  }
}
