// @flow
import React, { createElement, Component } from "react";
import Svg from "./Svg";

import "./Accordion.css";

type AccordionItem = {
  buttons?: Array<Object>,
  component(): any,
  header: string,
  opened: boolean,
  onToggle?: () => void,
  shouldOpen?: () => void
};

type Props = { items: Array<Object> };

type AccordionState = {
  opened: boolean[],
  created: boolean[]
};

class Accordion extends Component {
  state: AccordionState;

  props: Props;

  constructor(props: Props) {
    super();

    this.state = {
      opened: props.items.map(item => item.opened),
      created: []
    };

    const self: any = this;
    self.renderContainer = this.renderContainer.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    const newOpened = this.state.opened.map((isOpen, i) => {
      const { shouldOpen } = nextProps.items[i];

      return isOpen || (shouldOpen && shouldOpen());
    });

    this.setState({ opened: newOpened });
  }

  handleHeaderClick(i: number) {
    const opened = [...this.state.opened];
    const created = [...this.state.created];
    const item = this.props.items[i];

    opened[i] = !opened[i];
    created[i] = true;

    if (opened[i] && item.onOpened) {
      item.onOpened();
    }

    if (item.onToggle) {
      item.onToggle(opened[i]);
    }

    this.setState({ opened, created });
  }

  renderContainer(item: AccordionItem, i: number) {
    const { opened, created } = this.state;
    const containerClassName = `${item.header
      .toLowerCase()
      .replace(/\s/g, "-")}-pane`;

    return (
      <div className={containerClassName} key={i}>
        <div className="_header" onClick={() => this.handleHeaderClick(i)}>
          <Svg name="arrow" className={opened[i] ? "expanded" : ""} />
          {item.header}
          {item.buttons ? (
            <div className="header-buttons">{item.buttons}</div>
          ) : null}
        </div>
        {created[i] || opened[i] ? (
          <div
            className="_content"
            style={{ display: opened[i] ? "block" : "none" }}
          >
            {createElement(item.component, item.componentProps || {})}
          </div>
        ) : null}
      </div>
    );
  }

  render() {
    return (
      <div className="accordion">
        {this.props.items.map(this.renderContainer)}
      </div>
    );
  }
}

Accordion.displayName = "Accordion";

export default Accordion;
