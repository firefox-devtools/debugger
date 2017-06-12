// @flow
import { createFactory, Component } from "react";
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
  getKey: Item => string,
  getParent: () => any,
  getRoots: () => any,
  highlightItems?: Array<Item>,
  itemHeight: number,
  listItems?: Array<Item>,
  onFocus?: (item: any) => any,
  onExpand?: (item: any) => any,
  onCollapse?: (item: any) => any,
  renderItem: any
};

type ManagedTreeState = {
  expanded: any,
  focusedItem: ?Item
};

class ManagedTree extends Component {
  state: ManagedTreeState;
  props: Props;

  constructor() {
    super();

    this.state = {
      expanded: new Set(),
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
  }

  setExpanded(item: Item, isExpanded: boolean) {
    const expanded = this.state.expanded;
    const key = this.props.getKey(item);
    if (isExpanded) {
      expanded.add(key);
    } else {
      expanded.delete(key);
    }
    this.setState({ expanded });

    if (isExpanded && this.props.onExpand) {
      this.props.onExpand(item);
    } else if (!expanded && this.props.onCollapse) {
      this.props.onCollapse(item);
    }
  }

  expandListItems(listItems: Array<Item>) {
    const expanded = this.state.expanded;
    listItems.forEach(item => expanded.add(this.props.getKey(item)));
    this.focusItem(listItems[0]);
    this.setState({ expanded: expanded });
  }

  highlightItem(highlightItems: Array<Item>) {
    const expanded = this.state.expanded;

    // This file is visible, so we highlight it.
    if (expanded.has(this.props.getKey(highlightItems[0]))) {
      this.focusItem(highlightItems[0]);
    } else {
      // Look at folders starting from the top-level until finds a
      // closed folder and highlights this folder
      const index = highlightItems
        .reverse()
        .findIndex(item => !expanded.has(this.props.getKey(item)));
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

    const props = Object.assign({}, this.props, {
      isExpanded: item => expanded.has(this.props.getKey(item)),
      focused: focusedItem,

      onExpand: item => this.setExpanded(item, true),
      onCollapse: item => this.setExpanded(item, false),
      onFocus: this.focusItem,

      renderItem: (...args) => {
        return this.props.renderItem(...args, {
          setExpanded: this.setExpanded
        });
      }
    });

    return Tree(props);
  }
}

ManagedTree.displayName = "ManagedTree";

ManagedTree.propTypes = Object.assign({}, Tree.propTypes);

export default ManagedTree;
