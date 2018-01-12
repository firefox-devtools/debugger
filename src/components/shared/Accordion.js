/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { cloneElement, Component } from "react";
import Svg from "./Svg";

import "./Accordion.css";

type AccordionItem = {
  buttons?: Array<Object>,
  component: any,
  componentProps: Object,
  header: string,
  className: string,
  opened: boolean,
  onToggle?: () => void,
  shouldOpen?: () => void
};

type Props = { items: Array<Object> };

type State = {
  opened: boolean[],
  created: boolean[]
};

class Accordion extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      opened: props.items.map(item => item.opened),
      created: []
    };
  }

  handleHeaderClick(i: number) {
    const item = this.props.items[i];
    const opened = !item.opened;
    item.opened = opened;

    if (item.onToggle) {
      item.onToggle(opened);
    }

    // We force an update because otherwise the accordion
    // would not re-render
    this.forceUpdate();
  }

  renderContainer = (item: AccordionItem, i: number) => {
    const { opened } = item;

    return (
      <div className={item.className} key={i}>
        <div className="_header" onClick={() => this.handleHeaderClick(i)}>
          <Svg name="arrow" className={opened === true ? "expanded" : ""} />
          {item.header}
          {item.buttons ? (
            <div className="header-buttons">{item.buttons}</div>
          ) : null}
        </div>
        {opened && (
          <div className="_content">
            {cloneElement(item.component, item.componentProps || {})}
          </div>
        )}
      </div>
    );
  };

  render() {
    return (
      <div className="accordion">
        {this.props.items.map(this.renderContainer)}
      </div>
    );
  }
}

export default Accordion;
