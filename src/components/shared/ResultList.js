// @flow
import { DOM as dom, Component } from "react";
import classnames from "classnames";

import "./ResultList.css";

type ResultListItem = {
  id: string,
  subtitle: string,
  title: string,
  value: string
};

export default class ResultList extends Component {
  displayName: "ResultList";
  props: {
    items: Array<Object>,
    selected: number,
    selectItem: () => any,
    size: string
  };

  static defaultProps: Object;

  constructor(props: any) {
    super(props);
    (this: any).renderListItem = this.renderListItem.bind(this);
  }

  renderListItem(item: ResultListItem, index: number) {
    return dom.li(
      {
        onClick: event => this.props.selectItem(event, item, index),
        key: `${item.id}${item.value}${index}`,
        ref: index,
        title: item.value,
        className: classnames({
          selected: index === this.props.selected
        })
      },
      dom.div({ className: "title" }, item.title),
      dom.div({ className: "subtitle" }, item.subtitle)
    );
  }

  render() {
    let { size } = this.props;
    size = size || "";
    return dom.ul(
      {
        className: `result-list ${size}`
      },
      this.props.items.map(this.renderListItem)
    );
  }
}

ResultList.defaultProps = {
  size: ""
};
