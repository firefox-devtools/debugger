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
  size: string,
  role: string
};

export default class ResultList extends Component<Props> {
  displayName: "ResultList";

  static defaultProps = {
    size: "small",
    role: "listbox"
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
      "aria-labelledby": `${item.id}-title`,
      "aria-describedby": `${item.id}-subtitle`,
      role: "option",
      className: classnames("result-item", {
        selected: index === selected
      })
    };

    return (
      <li {...props}>
        <div id={`${item.id}-title`} className="title">
          {item.title}
        </div>
        <div id={`${item.id}-subtitle`} className="subtitle">
          {item.subtitle}
        </div>
      </li>
    );
  }

  render() {
    const { size, items, role, selected } = this.props;

    return (
      <ul
        className={classnames("result-list", size)}
        id="result-list"
        role={role}
        aria-activedescendant={
          typeof items !== undefined && items.length > 0
            ? items[selected].id + "-title"
            : null
        }
        aria-expanded={typeof items !== undefined && items.length > 0}
        aria-live="polite"
      >
        {items.map(this.renderListItem)}
      </ul>
    );
  }
}
