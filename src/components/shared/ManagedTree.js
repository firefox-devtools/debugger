// @flow
import React, { createFactory, Component } from "react";
import "./ManagedTree.css";

import { Tree as _Tree } from "devtools-components";
const Tree = createFactory(_Tree);

export type Item = {
  contents: any,
  name: string,
  path: string
};

type Props = {
  autoExpandAll: boolean,
  autoExpandDepth: number,
  getChildren: Item => Item[],
  getPath: Item => string,
  getParent: () => any,
  getRoots: () => any,
  highlightItems?: Array<Item>,
  itemHeight: number,
  listItems?: Array<Item>,
  onFocus?: (item: any) => void,
  onExpand?: (item: any, expanded: Set<Item>) => void,
  onCollapse?: (item: any, expanded: Set<Item>) => void,
  renderItem: any,
  disabledFocus?: boolean,
  focused?: any,
  expanded?: any
};

type ManagedTreeState = {
  expanded: any,
  focusedItem: ?Item
};

class ManagedTree extends Component {
  state: ManagedTreeState;
  props: Props;

  constructor(props: Props) {
    super();

    this.state = {
      expanded: props.expanded || new Set(),
      focusedItem: null
    };

    const self: any = this;
    self.setExpanded = this.setExpanded.bind(this);
    self.focusItem = this.focusItem.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    const listItems = nextProps.listItems;
    if (listItems && listItems != this.props.listItems && listItems.length) {
      this.expandListItems(listItems);
    }

    const highlightItems = nextProps.highlightItems;
    if (
      highlightItems &&
      highlightItems != this.props.highlightItems &&
      highlightItems.length
    ) {
      this.highlightItem(highlightItems);
    }

    if (nextProps.focused && nextProps.focused !== this.props.focused) {
      this.focusItem(nextProps.focused);
    }
  }

  setExpanded(item: Item, isExpanded: boolean) {
    const expanded = this.state.expanded;
    const itemPath = this.props.getPath(item);
    if (isExpanded) {
      expanded.add(itemPath);
    } else {
      expanded.delete(itemPath);
    }
    this.setState({ expanded });

    if (isExpanded && this.props.onExpand) {
      this.props.onExpand(item, expanded);
    } else if (!isExpanded && this.props.onCollapse) {
      this.props.onCollapse(item, expanded);
    }
  }

  expandListItems(listItems: Array<Item>) {
    const expanded = this.state.expanded;
    listItems.forEach(item => expanded.add(this.props.getPath(item)));
    this.focusItem(listItems[0]);
    this.setState({ expanded });
  }

  highlightItem(highlightItems: Array<Item>) {
    const expanded = this.state.expanded;

    // This file is visible, so we highlight it.
    if (expanded.has(this.props.getPath(highlightItems[0]))) {
      this.focusItem(highlightItems[0]);
    } else {
      // Look at folders starting from the top-level until finds a
      // closed folder and highlights this folder
      const index = highlightItems
        .reverse()
        .findIndex(item => !expanded.has(this.props.getPath(item)));
      this.focusItem(highlightItems[index]);
    }
  }

  focusItem(item: Item) {
    if (!this.props.disabledFocus && this.state.focusedItem !== item) {
      this.setState({ focusedItem: item });

      if (this.props.onFocus) {
        this.props.onFocus(item);
      }
    }
  }

  render() {
    const { expanded, focusedItem } = this.state;

    const overrides = {
      isExpanded: item => expanded.has(this.props.getPath(item)),
      focused: focusedItem,
      getKey: this.props.getPath,
      onExpand: item => this.setExpanded(item, true),
      onCollapse: item => this.setExpanded(item, false),
      onFocus: this.focusItem,
      renderItem: (...args) =>
        this.props.renderItem(...args, {
          setExpanded: this.setExpanded
        })
    };

    const props = { ...this.props, ...overrides };
    return (
      <div className="managed-tree">
        <Tree {...props} />
      </div>
    );
  }
}

export default ManagedTree;
