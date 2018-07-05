/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import { getDescendants } from "../../utils/sources-tree";
import "./ManagedTree.css";

const { Tree } = require("devtools-components");

export type Item = {
  contents: any,
  name: string,
  path: string
};

type Props = {
  autoExpandAll: boolean,
  autoExpandDepth: number,
  getChildren: Object => Object[],
  getPath: (Object, index?: number) => string,
  getParent: Item => any,
  getRoots: () => any,
  highlightItems?: Array<Item>,
  itemHeight: number,
  listItems?: Array<Item>,
  onFocus?: (item: any) => void,
  onExpand?: (item: Item, expanded: Set<string>) => void,
  onCollapse?: (item: Item, expanded: Set<string>) => void,
  renderItem: any,
  disabledFocus?: boolean,
  focused?: any,
  expanded?: any
};

type State = {
  expanded: any,
  focusedItem: ?Item
};

class ManagedTree extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: props.expanded || new Set(),
      focusedItem: null
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { listItems, highlightItems, focused } = this.props;
    if (nextProps.listItems && nextProps.listItems != listItems) {
      this.expandListItems(nextProps.listItems);
    }

    if (
      nextProps.highlightItems &&
      nextProps.highlightItems != highlightItems
    ) {
      this.highlightItem(nextProps.highlightItems);
    }

    if (nextProps.focused && nextProps.focused !== focused) {
      this.focusItem(nextProps.focused);
    }
  }

  expandItem = (item: Item, shouldExpand: boolean) => {
    const { expanded } = this.state;
    const path = item.path;
    if (shouldExpand) {
      expanded.add(path);
    } else {
      expanded.delete(path);
    }
  };

  setExpanded = (
    item: Object,
    isExpanded: boolean,
    shouldIncludeChildren: boolean
  ) => {
    const { expanded } = this.state;

    this.expandItem(item, isExpanded);

    if (shouldIncludeChildren) {
      getDescendants(item).map(child => this.expandItem(child, isExpanded));
    }

    this.setState({ expanded });

    if (isExpanded && this.props.onExpand) {
      this.props.onExpand(item, expanded);
    } else if (!isExpanded && this.props.onCollapse) {
      this.props.onCollapse(item, expanded);
    }
  };

  expandListItems(listItems: Array<Item>) {
    const { expanded } = this.state;
    listItems.forEach(item => this.expandItem(item, true));

    this.focusItem(listItems[0]);
    this.setState({ expanded });
  }

  // Highlight either the source or the first closed directory.
  highlightItem(highlightItems: Array<Item>) {
    const { expanded } = this.state;

    const [sourceItem, ...directories] = highlightItems;

    if (expanded.has(sourceItem.path)) {
      return this.focusItem(sourceItem);
    }

    // sort the directories top-down excluding the root
    const highlightItem = directories
      .slice(1)
      .reverse()
      .find(item => !expanded.has(item.path));

    if (highlightItem) {
      this.focusItem(highlightItem);
    }
  }

  focusItem = (item: Item) => {
    if (!this.props.disabledFocus && this.state.focusedItem !== item) {
      this.setState({ focusedItem: item });

      if (this.props.onFocus) {
        this.props.onFocus(item);
      }
    }
  };

  render() {
    const { expanded, focusedItem } = this.state;
    return (
      <div className="managed-tree">
        <Tree
          {...this.props}
          isExpanded={item => expanded.has(item.path)}
          focused={focusedItem}
          getKey={item => item.path}
          onExpand={item => this.setExpanded(item, true, false)}
          onCollapse={item => this.setExpanded(item, false, false)}
          onFocus={this.focusItem}
          renderItem={(...args) =>
            this.props.renderItem(...args, {
              setExpanded: this.setExpanded
            })
          }
        />
      </div>
    );
  }
}

export default ManagedTree;
