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

type Props = {
  items: Array<ResultListItem>,
  selected: number,
  selectItem: () => any,
  size: string
};

export default class ResultList extends Component {
  displayName: "ResultList";
  props: Props;

  static defaultProps: Object;

  constructor(props: Props) {
    super(props);
    (this: any).renderListItem = this.renderListItem.bind(this);
  }

  renderListItem(item: ResultListItem, index: number) {
    const { selectItem, selected } = this.props;
    return dom.li(
      {
        onClick: event => selectItem(event, item, index),
        key: `${item.id}${item.value}${index}`,
        ref: index,
        title: item.value,
        className: classnames({
          selected: index === selected
        })
      },
      dom.div({ className: "title" }, item.title),
      dom.div({ className: "subtitle" }, item.subtitle)
    );
  }

  render() {
    let { size, items } = this.props;
    size = size || "";
    return dom.ul(
      {
        className: `result-list ${size}`
      },
      items.map(this.renderListItem)
    );
  }
}

ResultList.defaultProps = {
  size: ""
};
